function startLevel(opt) {
    const level = res.levels.dict[opt.levelId] || res.levels.lvl[0]
    env.level = level
    log(`Starting #${level.index} - ${level.title}`)
    lab.spawn('hud/LevelTitle', {
        title: level.title,
        x: rx(.5),
        y: ry(.12),
    })

    const hero = _$.hero
    let planet = _$.planet
    const nx = opt.jump? planet.x + rx(1) : 0
    const ny = opt.jump? planet.y - ry(.5) : 0
    if (opt.jump) hero.teleport()

    planet = lab.cam.spawn('Planet', {
        x: nx,
        y: ny,
        //r: ry(.24),
        r: ry(level.size || .4),
        color: level.color || hsl(.4, .3, .4),
        surfaceColor: level.surfaceColor ||hsl(.4, .5, .5),
    })
    _$.planet = planet

    hero.hits = env.tune.hits[env.options.difficulty]
    hero.land(planet)
    lab.cam.follow(hero.target, true)

    if (_$.musicPlayer) _$.musicPlayer.stop()
    _$.musicPlayer = lab.spawn('MusicPlayer', level)

    trap('report', {
        type: 'levelStart',
        level: level.index,
    })
}
