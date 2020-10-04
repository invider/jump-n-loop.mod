function startGame(options) {

    const cam = lab.spawn('SlideCamera', {
        name: 'cam',
        speed: ry(.5),
        x: 0,
        y: 0,
    })

    const planet = cam.spawn('Planet', {
        name: 'planet',
        x: 0,
        y: 0,
        //r: ry(.24),
        r: ry(.4),
        options: options 
    })
    _$.planet = planet

    const hero = lab.spawn('Hero')
    _$.hero = hero
    hero.land(planet)
    cam.target = hero.target

    _$.musicPlayer = lab.spawn('MusicPlayer')

    lab.control.player.bindAll(hero)
}
