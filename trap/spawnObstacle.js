let id = 0;
function spawnObstacle(e) {

    _$.planet.spawn("surface/Body", {
        angle: lib.math.normalizeAngle( - _$.planet.angle
            + PI + env.tune.rotationSpeed * env.tune.spawnOffset),
        name: 'tree' + (++id)
    });
}
