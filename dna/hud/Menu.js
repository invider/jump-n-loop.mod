const ACTIVE = 1
const DISABLED = 0

const df = {
    name: 'menu',
    x: rx(.3),
    y: 0,
    w: rx(.4),
    h: ry(1),
    step: 45,
    current: 0,
    border: 2,
    IDLE: 20,
    shadow: true,
}

function isSwitch(item) {
    return isArray(item)
}

function isOption(item) {
    return (isObj(item) && item.option)
}

class Menu {

    constructor(st) {
        augment(this, df)
        augment(this, st)

        this.color = {
            main: env.style.neutralColor,
            acolor: env.style.activeColor,
            //main: hsl(.15, 0, 1),
            //acolor: hsl(.12, .5, .5),

            bcolor: hsl(.01, .2, .2),
            dcolor: hsl(.1,  .5, .6),
            scolor: hsl(.5,  .5, .5),
        }
    }

    sync() {
        this.items.forEach(item => {
            if (item.sync) item.sync()
        })
    }

    syncIn() {
        this.items.forEach(item => {
            if (item.syncIn) item.syncIn()
        })
    }

    show() {
        this.hidden = false
        this.state = ACTIVE
        this.lastTouch = Date.now()
        this.syncIn()
        lab.control.player.bindAll(this)
    }

    hide() {
        this.hidden = true
        this.state = DISABLED
        this.sync()
        lab.control.player.unbindAll(this)
    }

    selectFrom(st) {
        extend(this, st)
        if (!this.preservePos) this.current = 0

        this.items.forEach(item => {
            if (isSwitch(item) || isOption(item)) {
                if (!item.current) item.current = 0
                if (item.load) item.load()
            }
        })
        this.slideToActiveItem()
        this.show()
    }

    slideToActiveItem() {
        const item = this.items[this.current]
        if (isObj(item) && item.section) {
            this.current ++
            if (this.current >= this.items.length) this.current = 0
            this.slideToActiveItem()
        }
    }

    next() {
        if (this.hidden) return
        this.current ++
        if (this.current >= this.items.length) this.current = 0

        const item = this.items[this.current]
        if (isObj(item) && (item.section || item.disabled)) {
            this.next()
        } else {
            // landed
            if (this.onMove) this.onMove(item)
            sfx('sfx/select', env.mixer.select)
        }
        
    }

    prev() {
        if (this.hidden) return
        this.current --
        if (this.current < 0) this.current = this.items.length - 1

        const item = this.items[this.current]
        if (isObj(item) && (item.section || item.disabled)) {
            this.prev()
        } else {
            // landed
            if (this.onMove) this.onMove(item)
            sfx('sfx/select', env.mixer.select)
        }
    }

    left() {
        if (this.hidden) return
        const item = this.currentItem()
        if (isSwitch(item)) {
            item.current --
            if (item.current < 0) {
                if (item.limit) {
                    item.current = 0
                    return
                } else {
                    item.current = item.length - 1
                }
            }
            if (item.onSwitch) item.onSwitch(item, this.current)
            else if (this.onSwitch) this.onSwitch(item, this.current)
            if (item.sync) item.sync()
            sfx('sfx/apply', env.mixer.switch)

        } else if (isOption(item)) {
            item.current --
            if (item.current < 0) {
                if (item.limit) {
                    item.current = 0
                    return
                } else {
                    item.current = item.options.length - 1
                }
            }
            if (item.onSwitch) item.onSwitch(item, this.current)
            else if (this.onSwitch) this.onSwitch(item, this.current)
            if (item.sync) item.sync()
            sfx('sfx/apply', env.mixer.switch)
        }
        if (this.onMove) this.onMove(item)
    }

    right() {
        if (this.hidden) return
        const item = this.currentItem()
        if (isSwitch(item)) {
            item.current ++
            if (item.current >= item.length) {
                if (item.limit) {
                    item.current = item.length - 1
                    return
                } else {
                    item.current = 0
                }
            }
            if (item.onSwitch) item.onSwitch(item, this.current)
            else if (this.onSwitch) this.onSwitch(item, this.current)
            if (item.sync) item.sync()
            sfx('sfx/apply', env.mixer.switch)

        } else if (isOption(item)) {
            item.current ++
            if (item.current >= item.options.length) {
                if (item.limit) {
                    item.current = item.options.length - 1
                    return
                } else {
                    item.current = 0
                }
            }
            if (item.onSwitch) item.onSwitch(item, this.current)
            else if (this.onSwitch) this.onSwitch(item, this.current)
            if (item.sync) item.sync()
            sfx('sfx/apply', env.mixer.switch)
        }
        if (this.onMove) this.onMove(item)
    }

    select() {
        const item = this.currentItem()
        if (isSwitch(item) || isOption(item)) {
            this.right()
        } else {
            if (item.onSelect) {
                item.onSelect(this)
                sfx('sfx/use', env.mixer.apply)
            } else if (this.onSelect) {
                this.onSelect(item)
                sfx('sfx/use', env.mixer.apply)
            }
        }
    }

    back() {
        if (this.onBack) {
            this.onBack( this.currentItem() )
        }
        sfx('sfx/noisy', env.mixer.level.apply)
    }

    activate(action) {
        this.lastTouch = Date.now()
        switch(action) {
            case 2: this.prev(); break;
            case 3: this.left(); break;
            case 4: this.next(); break;
            case 5: this.right(); break;
            case 1: this.select(); break;
            case 6: this.back(); break;
        }
    }

    focusOn(name) {
        const i = this.items.indexOf(name)
        if (i >= 0) this.current = i
    }

    draw() {
        if (!this.items) return
        const n = this.items.length
        const cx = this.x + floor(this.w/2)
        const cy = this.y + floor(this.h/2)

        alignCenter()
        baseTop()
        font(env.style.font)

        const b = this.border
        const x = cx
        const rx = this.x
        const rw = this.w
        const h = n * this.step + 2*b
        let y = cy - floor(h/2)

        /*
        if (this.showBackground) {
            fill(this.background)
            rect(rx, y-2*b, rw, h)
        }
        */

        for (let i = 0; i < n; i++) {
            let hidden = false
            let active = true
            let disabled = false
            let item = this.items[i]
            if (isArray(item)) {
                if (item.hidden) hidden = true
                if (item.disabled) disabled = true
                item = '< ' + item[item.current] + ' >'
            } else if (isObj(item)) {
                if (item.hidden) hidden = true
                if (item.section) {
                    active = false
                    item = item.title
                } else if (item.option) {
                    item = item.title + ': ' + item.options[item.current]
                } else {
                    item = item.title
                }
            }

            if (!hidden) {
                // backline
                //if (i === this.current) fill(this.color.bacolor)
                //else fill(this.color.bcolor)
                //rect(rx+b, y-1, rw-2*b, this.step-2)

                if (this.shadow) {
                    fill('#000000')
                    text(item, x+2, y+2)
                }

                if (!active) fill(this.color.scolor)
                else if (disabled) fill(this.color.dcolor)
                else if (i === this.current) fill(this.color.acolor)
                else fill(this.color.main)
                text(item, x, y)
                y += this.step
            }
        }
    }

    currentItem() {
        return this.items[this.current]
    }

    selectedValue(i) {
        const item = this.items[i]
        if (isString(item)) {
            return item
        } else if (isArray(item)) {
            return item[item.current]
        } else if (isObj(item)) {
            if (item.option) {
                if (item.values) return item.values[item.current]
                else return item.options[item.current]
            } else {
                return item.title
            }
        }
    }

    options() {
        const map = {}
        const menu = this

        for (let i = 0; i < this.items.length; i++) {
            const e = this.items[i]
            if (e.id) {
                map[e.id] = menu.selectedValue(i)
            }
        }
        return map
    }

    evo(dt) {
        if (this.state === DISABLED) return

        const idle = (Date.now() - this.lastTouch)/1000
        if (this.onIdle && idle >= this.IDLE) {
            this.onIdle()
            this.lastTouch = Date.now()
        }
    }
}
