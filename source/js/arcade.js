(() => {
  const arcade = document.querySelector('[data-arcade]');
  if (!arcade) return;
  const t = window.MoriiI18n.t;
  const stage = arcade.querySelector('[data-game-stage]');
  const board = arcade.querySelector('[data-board]');
  const choices = [...arcade.querySelectorAll('[data-game]')];
  const title = arcade.querySelector('#arcade-title');
  const rules = arcade.querySelector('#arcade-rules');
  const score = arcade.querySelector('[data-score]');
  const timer = arcade.querySelector('[data-timer]');
  const status = arcade.querySelector('[data-status]');
  const reset = arcade.querySelector('[data-reset]');
  const undo = arcade.querySelector('[data-undo]');
  const pause = arcade.querySelector('[data-pause]');
  const recordKey = 'morii:arcade:firefly:best';
  let best = 0;
  try { best = Math.max(0, Number(localStorage.getItem(recordKey)) || 0); } catch {}
  let game, state, cells, size, clock;
  let focusCell = 0;
  const rounds = new Map();
  const sprintDuration = 20000;
  const trailLevels = [
    { marks: [0, 7, 12, 19, 24], walls: [] },
    { marks: [4, 8, 11, 16, 20], walls: [2, 7, 17, 23] },
    { marks: [0, 6, 8, 18, 20], walls: [1, 2, 9, 11, 14, 22, 23] }
  ];
  const gardenShuffles = [5, 7, 9];
  const pick = items => items[Math.floor(Math.random() * items.length)];
  const indexes = size => Array.from({ length: size * size }, (_, index) => index);
  const games = {
    trail: ['星轨接力', '从 ◇ 出发，沿上下左右依次经过 1、2、3，再抵达 ★。走过的格子和墙不能通行。'],
    garden: ['相位花园', '点击任意花格，推进它、右邻和下邻的生长阶段。棋盘边缘首尾相连，目标是让全盘开花。'],
    firefly: ['萤火冲刺', '20 秒内尽量多点亮 ✦，避开 ◈。每连中 5 次可获得额外 1 分。']
  };

  function trail(level) {
    const layout = trailLevels[level];
    const turn = Math.floor(Math.random() * 4);
    const flip = Math.random() < .5;
    const rotate = index => {
      let col = index % 5;
      let row = Math.floor(index / 5);
      if (flip) col = 4 - col;
      for (let i = 0; i < turn; i++) [row, col] = [col, 4 - row];
      return row * 5 + col;
    };
    const marks = layout.marks.map(rotate);
    return { level, marks, walls: layout.walls.map(rotate), path: [marks[0]], progress: 0, won: false };
  }

  function gardenNeighbors(index) {
    const row = Math.floor(index / 4);
    const col = index % 4;
    return [index, row * 4 + (col + 1) % 4, ((row + 1) % 4) * 4 + col];
  }

  function grow(plot, index, amount) {
    for (const cell of gardenNeighbors(index)) {
      plot[cell] = (plot[cell] + amount + 3) % 3;
    }
  }

  function garden(level) {
    const plot = Array(16).fill(2);
    const options = indexes(4);
    for (let i = 0; i < gardenShuffles[level]; i++) {
      const selected = options.splice(Math.floor(Math.random() * options.length), 1)[0];
      grow(plot, selected, -1);
    }
    return { level, plot, moves: [], won: false };
  }

  function refreshFirefly() {
    const indexes16 = indexes(4);
    state.target = pick(indexes16.filter(index => index !== state.target));
    const options = indexes16.filter(index => index !== state.target);
    state.decoys = [options.splice(Math.floor(Math.random() * options.length), 1)[0]];
    if (state.points >= 10) state.decoys.push(pick(options));
  }

  function stopClock() {
    clearInterval(clock);
    clock = undefined;
  }

  function finishSprint() {
    stopClock();
    const record = state.points > best;
    if (record) {
      best = state.points;
      try { localStorage.setItem(recordKey, String(best)); } catch {}
    }
    const boardFocused = board.contains(document.activeElement);
    state.end = 0;
    state.paused = 0;
    state.seconds = 0;
    state.message = record ? '新纪录！' : '时间到！';
    render();
    if (boardFocused) reset.focus();
  }

  function pauseSprint() {
    const remaining = state.end - performance.now();
    if (remaining <= 0) return finishSprint();
    stopClock();
    state.end = 0;
    state.paused = remaining;
    state.seconds = Math.ceil(remaining / 1000);
    state.message = '挑战已暂停。';
  }

  function startSprint(resume) {
    if (!resume) {
      Object.assign(state, { points: 0, streak: 0, seconds: sprintDuration / 1000 });
      refreshFirefly();
    }
    stopClock();
    state.end = performance.now() + (resume ? state.paused : sprintDuration);
    state.paused = 0;
    state.message = resume ? '' : '开始！';
    clock = setInterval(tickSprint, 120);
    render();
    cells[focusCell].focus();
  }

  function tickSprint() {
    const remaining = Math.ceil((state.end - performance.now()) / 1000);
    if (remaining <= 0) finishSprint();
    else if (remaining !== state.seconds) {
      state.seconds = remaining;
      renderScore();
    }
  }

  function buildBoard() {
    board.style.setProperty('--arcade-columns', size);
    cells = indexes(size).map(index => {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'arcade-cell';
      cell.dataset.cell = index;
      return cell;
    });
    board.replaceChildren(...cells);
  }

  function select(next) {
    if (state) {
      if (game === 'firefly' && state.end) pauseSprint();
      state.focus = focusCell;
    }
    game = next;
    size = game === 'trail' ? 5 : 4;
    stage.dataset.skin = game;
    for (const button of choices) button.setAttribute('aria-pressed', String(button.dataset.game === game));
    title.textContent = t(games[game][0]);
    rules.textContent = t(games[game][1]);
    if (!rounds.has(game)) rounds.set(game, game === 'trail' ? trail(0) : game === 'garden' ? garden(0) : {
      end: 0, paused: 0, points: 0, streak: 0, seconds: sprintDuration / 1000
    });
    state = rounds.get(game);
    focusCell = state.focus ?? state.path?.[0] ?? 0;
    if (cells?.length !== size * size) buildBoard();
    render();
  }

  function renderScore() {
    const level = game === 'firefly' ? '' : t('第 {0} 关', state.level + 1) + ' · ';
    if (game === 'trail') score.textContent = level + t('路标 {0}/3 · {1} 步', state.progress, state.path.length - 1);
    if (game === 'garden') score.textContent = level + t('开花 {0}/16 · {1} 步', state.plot.filter(cell => cell === 2).length, state.moves.length);
    if (game === 'firefly') {
      score.textContent = t('{0} 秒 · {1} 分 · 最佳 {2}', state.seconds, state.points, best);
      timer.value = state.seconds;
      timer.toggleAttribute('data-low', state.seconds <= 5);
    }
  }

  function drawCell(index) {
    if (game === 'trail') {
      if (state.walls.includes(index)) return ['trail-wall', '▧', '墙'];
      const mark = state.marks.indexOf(index);
      const visited = state.path.includes(index);
      const head = state.path.at(-1) === index;
      if (head) return ['trail-head', mark === 0 ? '◇' : '●', '当前位置'];
      if (visited) return ['trail-visited', '·', '已经走过'];
      if (mark === 4) return ['trail-goal', '★', '终点'];
      if (mark > 0) return ['trail-mark', String(mark), t('路标 {0}', mark)];
    } else if (game === 'garden') {
      const phase = state.plot[index];
      return ['phase-' + phase, ['·', '◈', '✿'][phase], ['种子', '花苞', '开花'][phase]];
    } else if (state.end) {
      if (state.target === index) return ['firefly-hit', '✦', '萤火'];
      if (state.decoys.includes(index)) return ['firefly-decoy', '◈', '干扰光点'];
    }
    return ['', '·', '空格'];
  }

  function render() {
    const sprint = game === 'firefly';
    const inactive = sprint ? !state.end : state.won;
    if (sprint) reset.textContent = t(state.end ? '重新开始' : state.paused ? '继续挑战' : '开始挑战');
    else if (state.won) reset.textContent = t(state.level + 1 === (game === 'trail' ? trailLevels.length : gardenShuffles.length) ? '再玩一轮' : '下一关');
    else reset.textContent = t('重玩本关');
    undo.hidden = sprint;
    pause.hidden = !sprint || !(state.end || state.paused);
    pause.textContent = t(state.paused ? '重新开始' : '暂停挑战');
    timer.hidden = !sprint;
    undo.disabled = game === 'trail' ? state.path.length <= 1 : !state.moves?.length;
    for (const [index, cell] of cells.entries()) {
      const [style, symbol, label] = drawCell(index);
      cell.dataset.look = style;
      cell.textContent = symbol;
      cell.setAttribute('aria-label', t('第 {0} 行第 {1} 列', Math.floor(index / size) + 1, index % size + 1) + ' · ' + t(label));
      cell.disabled = inactive;
      cell.tabIndex = focusCell === index ? 0 : -1;
    }
    const message = state.message ? t(state.message) : '';
    if (status.textContent !== message) status.textContent = message;
    renderScore();
  }

  function visit(index) {
    const current = state.path.at(-1);
    const adjacent = Math.abs(current % 5 - index % 5) + Math.abs(Math.floor(current / 5) - Math.floor(index / 5)) === 1;
    const mark = state.marks.indexOf(index);
    if (!adjacent || state.path.includes(index) || state.walls.includes(index) || (mark > 0 && mark !== state.progress + 1)) return '';
    state.path.push(index);
    if (mark > 0 && mark < 4) state.progress++;
    state.won = mark === 4;
    return state.won ? '到达终点！' : '';
  }

  function tap(index) {
    if (game === 'trail') return visit(index);
    if (game === 'garden') {
      grow(state.plot, index, 1);
      state.moves.push(index);
      state.won = state.plot.every(phase => phase === 2);
      return state.won ? '满园开花！' : '';
    }
    if (index === state.target) {
      state.streak++;
      state.points += state.streak % 5 === 0 ? 2 : 1;
      refreshFirefly();
      return state.streak % 5 === 0 ? '连击加分！' : '';
    }
    state.streak = 0;
    if (state.decoys.includes(index)) {
      state.points = Math.max(0, state.points - 1);
      return '碰到干扰光点，扣 1 分。';
    }
    return '';
  }

  board.addEventListener('click', event => {
    const cell = event.target.closest('[data-cell]');
    if (!cell || cell.disabled) return;
    if (game === 'firefly' && performance.now() >= state.end) return finishSprint();
    focusCell = Number(cell.dataset.cell);
    state.message = tap(focusCell);
    render();
    if (state.won) reset.focus();
  });
  board.addEventListener('keydown', event => {
    const cell = event.target.closest('[data-cell]');
    if (!cell) return;
    const index = Number(cell.dataset.cell);
    const directions = {
      ArrowUp: index >= size ? index - size : index,
      ArrowDown: index + size < cells.length ? index + size : index,
      ArrowLeft: index % size ? index - 1 : index,
      ArrowRight: index % size === size - 1 ? index : index + 1
    };
    if (!Object.hasOwn(directions, event.key)) return;
    event.preventDefault();
    cell.tabIndex = -1;
    const next = cells[directions[event.key]];
    focusCell = directions[event.key];
    next.tabIndex = 0;
    next.focus();
  });
  reset.addEventListener('click', () => {
    if (game === 'firefly') return startSprint(Boolean(state.paused));
    if (state.won) {
      const count = game === 'trail' ? trailLevels.length : gardenShuffles.length;
      const next = (state.level + 1) % count;
      state = game === 'trail' ? trail(next) : garden(next);
    } else if (game === 'trail') {
      Object.assign(state, { path: [state.marks[0]], progress: 0, message: '' });
    } else {
      for (const move of state.moves) grow(state.plot, move, -1);
      state.moves = [];
      state.message = '';
    }
    rounds.set(game, state);
    focusCell = state.path?.[0] ?? 0;
    render();
  });
  pause.addEventListener('click', () => {
    if (state.paused) return startSprint(false);
    pauseSprint();
    render();
    reset.focus();
  });
  undo.addEventListener('click', () => {
    if (game === 'trail') {
      const removed = state.marks.indexOf(state.path.pop());
      if (removed > 0 && removed < 4) state.progress--;
    } else {
      grow(state.plot, state.moves.pop(), -1);
    }
    state.won = false;
    state.message = '';
    render();
    if (undo.disabled) cells[focusCell].focus();
  });
  for (const choice of choices) choice.addEventListener('click', () => {
    if (choice.dataset.game !== game) select(choice.dataset.game);
  });

  select('trail');
  arcade.querySelector('.arcade-picker').hidden = false;
  stage.hidden = false;
})();
