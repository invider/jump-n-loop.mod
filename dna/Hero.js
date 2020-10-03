// default values
const df = {
    x: rx(.5),
    y: ry(.5),
    r: ry(.05),
    dx: 0,
    dy: 0,
    speed: ry(.3),
}

class Hero {

    constructor(st) {
        augment(this, df)
        augment(this, st)
    }

    onSpawn() {
        this.pickRandomDirection()
    }

    pickRandomDirection() {
        const fi = PI/4
        this.dx = cos(fi) * this.speed
        this.dy = sin(fi) * this.speed
    }

    evo(dt) {
        // move
        this.x = this.x + this.dx * dt
        this.y = warp(this.y + this.dy * dt, 0, ry(1))

        // reflect from the screen edges
        if (this.dx > 0 && this.x > rx(1) - this.r
                || this.dx < 0 && this.x < this.r) {
            this.dx *= -1
        }
        if (this.dy > 0 && this.y > ry(1) - this.r
                || this.dy < 0 && this.y < this.r) {
            this.dy *= -1
        }
    }

    draw() {
        save()
        translate(this.x, this.y)

        lineWidth(2)
        stroke(.52, .5, .5)
        circle(0, 0, this.r)

        restore()
    }
}
