var Firework = {
    getInstance: function () {
        var firework = {}, num = 100, beforeBalst = BeforeBalst.getInstance(), inBalst = InBalst.getInstance(),
            afterBalst = AfterBalst.getInstance(), afterBalstList = [], status = 0, fireworkType = createCircleFirework,
            resistance = 0.1, roundness = 1, delay = 0, ctx = {};
        firework.setBeforeBalst = function (_beforeBalst) {
            beforeBalst.setAnimate(_beforeBalst);
        }
        firework.getBeforeBalst = function () {
            return beforeBalst;
        }
        firework.setInBalst = function (_inBalst) {
            inBalst.setAnimate(_inBalst);
        }
        firework.getInBalst = function () {
            return inBalst;
        }
        firework.setAfterBalst = function (_afterBalst) {
            afterBalst.setAnimate(_afterBalst);
        }
        firework.getAfterBalst = function () {
            return afterBalst;
        }
        firework.setAfterBalstList = function (_afterBalstList) {
            afterBalstList = _afterBalstList;
        }
        firework.getAfterBalstList = function () {
            return afterBalstList;
        }
        firework.setCtx = function (_ctx) {
            ctx = _ctx;
        }
        firework.getCtx = function () {
            return ctx;
        }
        firework.setStatus = function (_status) {
            status = _status;
        }
        firework.getStatus = function () {
            return status;
        }
        firework.setRoundness = function (_roundness) {
            roundness = _roundness;
        }
        firework.getRoundness = function () {
            return roundness;
        }
        firework.setResistance = function (_resistance) {
            resistance = _resistance;
        }
        firework.getResistance = function () {
            return resistance;
        }
        firework.setNum = function (_num) {
            num = _num;
        }
        firework.getNum = function () {
            return num;
        }
        firework.setDelay = function (_delay) {
            delay = _delay;
        }
        firework.getDelay = function () {
            return delay;
        }
        firework.setFireworkType = function (_fireworkType) {
            fireworkType = _fireworkType;
        }
        firework.getFireworkType = function () {
            return fireworkType;
        }
        firework.draw = function () {
            if (status == 2) {
                ctx.beginPath();
                ctx.arc(beforeBalst.getAnimate().getQuiescence().x, beforeBalst.getAnimate().getQuiescence().y, beforeBalst.getR(), 0, Math.PI * 2);
                ctx.closePath();
                ctx.fillStyle = beforeBalst.getColor();
                ctx.fill();
            } else if (status == 3) {
                var x = inBalst.getAnimate().getQuiescence().x, y = inBalst.getAnimate().getQuiescence().y,
                    r = inBalst.getR(), color = inBalst.getColor(), alpha = inBalst.getAlpha();
                var gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
                gradient.addColorStop(0, '#FFFFFF');
                gradient.addColorStop(0.2, color);
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.globalAlpha = alpha;
                ctx.fillStyle = gradient;
                ctx.fillRect(x - r, y - r, r * 2, r * 2);
            } else if (status == 4) {
                for (let i = 0; i < afterBalstList.length; i++) {
                    let afterBalstCopy = afterBalstList[i], animate = afterBalstCopy.getAnimate(),
                        x = animate.getQuiescence().x, y = animate.getQuiescence().y, r = afterBalstCopy.getR(),
                        color = afterBalstCopy.getColor(),
                        alpha = afterBalstCopy.getDelay() > 0 ? 0 : afterBalstCopy.getAlpha();
                    ctx.beginPath();
                    ctx.globalAlpha = alpha;
                    ctx.arc(x, y, r, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.fillStyle = color;
                    ctx.fill();
                }
            }
        };
        firework.update = function () {
            if (status == 1) {
                delay--;
                if (delay <= 0) {
                    status = 2;
                }
            } else if (status == 2) {
                var animate = beforeBalst.getAnimate(), move = animate.getMove(), quiescence = animate.getQuiescence(),
                    translate = animate.getTranslate(), life = beforeBalst.getLife();
                translate_animate_state(move, translate);
                change_quiescence(quiescence, move);
                beforeBalst.setLife(--life);
                if (life <= 0) {
                    status = 3;
                    inBalst.setLife(1);
                    inBalst.setColor("#FFFFFF");
                    inBalst.setR(400);
                    inBalst.setAlpha(0.4);
                    inBalst.setAnimate({quiescence: {x: quiescence.x, y: quiescence.y}});
                }
            } else if (status == 3) {
                var life = inBalst.getLife();
                inBalst.setLife(--life);
                if (life <= 0) {
                    status = 4;
                    fireworkType(firework);
                }
            } else if (status == 4) {
                for (let i = afterBalstList.length - 1; i >= 0; i--) {
                    let _afterBalst = afterBalstList[i], animate = _afterBalst.getAnimate(),
                        quiescence = animate.getQuiescence(), move = animate.getMove(),
                        translate = animate.getTranslate(), life = _afterBalst.getLife(), base = _afterBalst.getBase(),
                        custom_g = _afterBalst.getCustomG(), _delay = _afterBalst.getDelay();
                    if (_delay <= 0) {
                        translate.ax = -move.vx * resistance;
                        translate.ay = (getType(custom_g) == "number" ? custom_g : g) - move.vy * resistance;
                        if (Math.abs(translate.ay) < Math.pow(10, -8)) {
                            translate.ay = 0;
                        }
                        if (Math.abs(translate.ax) < Math.pow(10, -8)) {
                            translate.ax = 0;
                        }
                        translate_animate_state(move, translate);
                        change_quiescence(quiescence, move);
                        _afterBalst.setLife(--life);
                        _afterBalst.setAlpha(0.2 + life / base.life * base.alpha);
                        if (life <= 0) {
                            afterBalstList.splice(i, 1);
                        }
                        if (afterBalstList.length == 0) {
                            status = 5;
                        }
                    } else {
                        _afterBalst.setDelay(--_delay);
                    }
                }
            }
        }
        return firework;
    }
};
var BeforeBalst = {
    getInstance: function () {
        var beforeBalst = {}, animate = Animate.getInstance(), r = 0, life = 0, color = "#000000", base = {};
        beforeBalst.setAnimate = function (_beforeBalst) {
            let quiescence = getType(_beforeBalst.quiescence) == 'object' ? _beforeBalst.quiescence : {},
                move = getType(_beforeBalst.move) == 'object' ? _beforeBalst.move : {},
                translate = getType(_beforeBalst.translate) == 'object' ? _beforeBalst.translate : {};
            animate.setQuiescence(quiescence);
            animate.setMove(move);
            animate.setTranslate(translate);
        }
        beforeBalst.getAnimate = function () {
            return animate;
        }
        beforeBalst.setR = function (_r) {
            r = _r;
        }
        beforeBalst.getR = function () {
            return r;
        }
        beforeBalst.setColor = function (_color) {
            color = _color;
        }
        beforeBalst.getColor = function () {
            return color;
        }
        beforeBalst.setLife = function (_life) {
            life = _life;
        }
        beforeBalst.getLife = function () {
            return life;
        }
        beforeBalst.setBase = function () {
            base.animate = {
                quiescence: deepCopy(beforeBalst.getAnimate().getQuiescence()),
                move: deepCopy(beforeBalst.getAnimate().getMove()),
                translate: deepCopy(beforeBalst.getAnimate().getTranslate())
            };
            base.r = r;
            base.color = color;
            base.life = life;
        }
        beforeBalst.getBase = function () {
            return base;
        }
        return beforeBalst;
    }
};
var InBalst = {
    getInstance: function () {
        var inBalst = {}, animate = Animate.getInstance(), r = 0, color = "#000000", life = 0, alpha = 0.25;
        inBalst.setAnimate = function (_inBalst) {
            let quiescence = getType(_inBalst.quiescence) == 'object' ? _inBalst.quiescence : {},
                move = getType(_inBalst.move) == 'object' ? _inBalst.move : {},
                translate = getType(_inBalst.translate) == 'object' ? _inBalst.translate : {};
            animate.setQuiescence(quiescence);
            animate.setMove(move);
            animate.setTranslate(translate);
        }
        inBalst.getAnimate = function () {
            return animate;
        }
        inBalst.setR = function (_r) {
            r = _r;
        }
        inBalst.getR = function () {
            return r;
        }
        inBalst.setAlpha = function (_alpha) {
            alpha = _alpha > 1 ? 1 : (_alpha < 0 ? 0 : _alpha);
        }
        inBalst.getAlpha = function () {
            return alpha;
        }
        inBalst.setColor = function (_color) {
            color = _color;
        }
        inBalst.getColor = function () {
            return color;
        }
        inBalst.setLife = function (_life) {
            life = _life;
        }
        inBalst.getLife = function () {
            return life;
        }
        return inBalst;
    }
};
var AfterBalst = {
    getInstance: function () {
        var afterBalst = {}, animate = Animate.getInstance(), base = {}, alpha = 1, r = 0, color = "#FFFFFF", life = 0,
            delay = 0, custom_g = null;
        afterBalst.setBase = function () {
            base.life = life;
            base.alpha = alpha;
        }
        afterBalst.getBase = function () {
            return base;
        }
        afterBalst.setAnimate = function (_afterBalst) {
            let quiescence = getType(_afterBalst.quiescence) == 'object' ? _afterBalst.quiescence : {},
                move = getType(_afterBalst.move) == 'object' ? _afterBalst.move : {},
                translate = getType(_afterBalst.translate) == 'object' ? _afterBalst.translate : {};
            animate.setQuiescence(quiescence);
            animate.setMove(move);
            animate.setTranslate(translate);
        }
        afterBalst.getAnimate = function () {
            return animate;
        }
        afterBalst.setAlpha = function (_alpha) {
            alpha = _alpha > 1 ? 1 : (_alpha < 0 ? 0 : _alpha);
        }
        afterBalst.getAlpha = function () {
            return alpha;
        }
        afterBalst.setR = function (_r) {
            r = _r;
        }
        afterBalst.getR = function () {
            return r;
        }
        afterBalst.setDelay = function (_delay) {
            delay = _delay;
        }
        afterBalst.getDelay = function () {
            return delay;
        }
        afterBalst.setCustomG = function (_customG) {
            custom_g = _customG;
        }
        afterBalst.getCustomG = function () {
            return custom_g;
        }
        afterBalst.setColor = function (_color) {
            color = _color;
        }
        afterBalst.getColor = function () {
            return color;
        }
        afterBalst.setLife = function (_life) {
            life = _life;
        }
        afterBalst.getLife = function () {
            return life;
        }
        return afterBalst;
    }
};
var Animate = {
    getInstance: function () {
        var animate = {};
        var quiescence = {x: 0, y: 0, deg: 0, zoom: 1}, move = {vx: 0, vy: 0, pal: 0, scale: 0},
            translate = {ax: 0, ay: 0, apal: 0, ascale: 0};
        animate.setQuiescence = function (_quiescence) {
            quiescence.x = getType(_quiescence.x) != 'number' ? quiescence.x : _quiescence.x;
            quiescence.y = getType(_quiescence.y) != 'number' ? quiescence.y : _quiescence.y;
            quiescence.deg = getType(_quiescence.deg) != 'number' ? quiescence.deg : _quiescence.deg;
            quiescence.zoom = getType(_quiescence.zoom) != 'number' ? quiescence.zoom : _quiescence.zoom;
        }
        animate.getQuiescence = function () {
            return quiescence;
        }
        animate.setMove = function (_move) {
            move.vx = getType(_move.vx) != 'number' ? move.vx : _move.vx;
            move.vy = getType(_move.vy) != 'number' ? move.vy : _move.vy;
            move.pal = getType(_move.pal) != 'number' ? move.pal : _move.pal;
            move.scale = getType(_move.scale) != 'number' ? move.scale : _move.scale;
        }
        animate.getMove = function () {
            return move;
        }
        animate.setTranslate = function (_translate) {
            translate.ax = getType(_translate.ax) != 'number' ? translate.ax : _translate.ax;
            translate.ay = getType(_translate.ay) != 'number' ? translate.ay : _translate.ay;
            translate.apal = getType(_translate.apal) != 'number' ? translate.apal : _translate.apal;
            translate.ascale = getType(_translate.ascale) != 'number' ? translate.ascale : _translate.ascale;
        }
        animate.getTranslate = function () {
            return translate;
        }
        return animate;
    }
};

function createCircleFirework(firework) {
    var inBalst = firework.getInBalst(), num = firework.getNum(), roundness = firework.getRoundness(),
        resistance = firework.getResistance(), afterBalstList = [];
    for (let i = 0; i < num; i++) {
        let afterBalstCopy = AfterBalst.getInstance(), degree = i * 2 * Math.PI / num, animate = inBalst.getAnimate(),
            quiescence = animate.getQuiescence(), v = 20 * (roundness + (1 - roundness) * Math.random());
        afterBalstCopy.setLife(50 + Math.floor(Math.random() * 40));
        afterBalstCopy.setColor(randomColor());
        afterBalstCopy.setAlpha(1);
        afterBalstCopy.setR(2);
        afterBalstCopy.setAnimate({
            quiescence: {x: quiescence.x, y: quiescence.y},
            move: {vx: Math.cos(degree) * v, vy: Math.sin(degree) * v},
            translate: {ax: Math.cos(degree) * v * -resistance, ay: g - resistance * Math.sin(degree) * v}
        });
        afterBalstCopy.setBase();
        afterBalstList.push(afterBalstCopy);
    }
    firework.setAfterBalstList(afterBalstList);
}

function createHeartFirework(firework) {
    var inBalst = firework.getInBalst(), num = firework.getNum(), roundness = firework.getRoundness(),
        resistance = firework.getResistance(), afterBalstList = [];
    for (let i = 0; i < num; i++) {
        let afterBalstCopy = AfterBalst.getInstance(), degree = i * 2 * Math.PI / num, animate = inBalst.getAnimate(),
            quiescence = animate.getQuiescence(), v = 20 * (roundness + (1 - roundness) * Math.random());
        afterBalstCopy.setLife(50 + Math.floor(Math.random() * 40));
        afterBalstCopy.setColor(randomColor());
        afterBalstCopy.setAlpha(1);
        afterBalstCopy.setR(2);
        afterBalstCopy.setAnimate({
            quiescence: {x: quiescence.x, y: quiescence.y},
            move: {
                vx: 16 * Math.pow(Math.sin(degree), 3) / 13 * v,
                vy: -(13 * Math.cos(degree) - 5 * Math.cos(2 * degree) - 2 * Math.cos(3 * degree) - Math.cos(4 * degree)) / 13 * v
            },
            translate: {
                ax: 16 * Math.pow(Math.sin(degree), 3) / 13 * v * -resistance,
                ay: g - resistance * -(13 * Math.cos(degree) - 5 * Math.cos(2 * degree) - 2 * Math.cos(3 * degree) - Math.cos(4 * degree)) / 13 * v
            }
        });
        afterBalstCopy.setBase();
        afterBalstList.push(afterBalstCopy);
    }
    firework.setAfterBalstList(afterBalstList);
}

function createDoubleHeartFirework(firework) {
    var inBalst = firework.getInBalst(), num = firework.getNum(), roundness = firework.getRoundness(),
        resistance = firework.getResistance(), afterBalstList = [];
    for (let i = 0; i < num; i++) {
        let degree = i * 2 * Math.PI / num, animate = inBalst.getAnimate(), quiescence = animate.getQuiescence(),
            v = 20 * (roundness + (1 - roundness) * Math.random());
        if (i > num / 16 && i < num * 5 / 8) {
            let afterBalstCopy = AfterBalst.getInstance();
            afterBalstCopy.setLife(50 + Math.floor(Math.random() * 40));
            afterBalstCopy.setColor(randomColor());
            afterBalstCopy.setAlpha(1);
            afterBalstCopy.setR(2);
            afterBalstCopy.setAnimate({
                quiescence: {x: quiescence.x, y: quiescence.y},
                move: {
                    vx: 16 * Math.pow(Math.sin(degree), 3) / 13 * v + 20,
                    vy: -(13 * Math.cos(degree) - 5 * Math.cos(2 * degree) - 2 * Math.cos(3 * degree) - Math.cos(4 * degree)) / 13 * v
                },
                translate: {
                    ax: (16 * Math.pow(Math.sin(degree), 3) / 13 * v + 20) * -resistance,
                    ay: g - resistance * -(13 * Math.cos(degree) - 5 * Math.cos(2 * degree) - 2 * Math.cos(3 * degree) - Math.cos(4 * degree)) / 13 * v
                }
            });
            afterBalstCopy.setBase();
            afterBalstList.push(afterBalstCopy);
        }
        let afterBalstCopy = AfterBalst.getInstance();
        afterBalstCopy.setLife(50 + Math.floor(Math.random() * 40));
        afterBalstCopy.setColor(randomColor());
        afterBalstCopy.setAlpha(1);
        afterBalstCopy.setR(2);
        afterBalstCopy.setAnimate({
            quiescence: {x: quiescence.x, y: quiescence.y},
            move: {
                vx: 16 * Math.pow(Math.sin(degree), 3) / 13 * v,
                vy: -(13 * Math.cos(degree) - 5 * Math.cos(2 * degree) - 2 * Math.cos(3 * degree) - Math.cos(4 * degree)) / 13 * v
            },
            translate: {
                ax: 16 * Math.pow(Math.sin(degree), 3) / 13 * v * -resistance,
                ay: g - resistance * -(13 * Math.cos(degree) - 5 * Math.cos(2 * degree) - 2 * Math.cos(3 * degree) - Math.cos(4 * degree)) / 13 * v
            }
        });
        afterBalstCopy.setBase();
        afterBalstList.push(afterBalstCopy);
    }
    num = Math.floor(num / 4);
    for (let i = 0; i < num; i++) {
        let afterBalstCopy = AfterBalst.getInstance(), degree = 0, animate = inBalst.getAnimate(),
            quiescence = animate.getQuiescence(), v = 20 * (roundness + (1 - roundness) * Math.random());
        afterBalstCopy.setLife(50 + Math.floor(Math.random() * 40));
        afterBalstCopy.setColor(randomColor());
        afterBalstCopy.setAlpha(1);
        afterBalstCopy.setR(2);
        afterBalstCopy.setAnimate({
            quiescence: {x: quiescence.x, y: quiescence.y},
            move: {vx: Math.cos(degree) * v + 20 + 30 * i / num, vy: Math.sin(degree) * v},
            translate: {
                ax: (Math.cos(degree) * v + 20 + 30 * i / num) * -resistance,
                ay: g - resistance * Math.sin(degree) * v
            }
        });
        afterBalstCopy.setBase();
        afterBalstList.push(afterBalstCopy);
    }
    num = Math.floor(num * 4 / 3);
    for (let i = 0; i < num; i++) {
        let afterBalstCopy = AfterBalst.getInstance(), degree = Math.PI, animate = inBalst.getAnimate(),
            quiescence = animate.getQuiescence(), v = 20 * (roundness + (1 - roundness) * Math.random());
        afterBalstCopy.setLife(50 + Math.floor(Math.random() * 40));
        afterBalstCopy.setColor(randomColor());
        afterBalstCopy.setAlpha(1);
        afterBalstCopy.setR(2);
        afterBalstCopy.setAnimate({
            quiescence: {x: quiescence.x, y: quiescence.y},
            move: {vx: Math.cos(degree) * v + 10 - 30 * i / num, vy: Math.sin(degree) * v},
            translate: {
                ax: (Math.cos(degree) * v + 10 - 30 * i / num) * -resistance,
                ay: g - resistance * Math.sin(degree) * v
            }
        });
        afterBalstCopy.setBase();
        afterBalstList.push(afterBalstCopy);
    }
    num = Math.floor(num * 12 / 5);
    for (let i = 0; i < num; i++) {
        let afterBalstCopy = AfterBalst.getInstance(), degree = i * 2 * Math.PI / num, animate = inBalst.getAnimate(),
            quiescence = animate.getQuiescence(), v = 20 * (roundness + (1 - roundness) * Math.random()) / 6;
        afterBalstCopy.setLife(50 + Math.floor(Math.random() * 40));
        afterBalstCopy.setColor(randomColor());
        afterBalstCopy.setAlpha(1);
        afterBalstCopy.setR(2);
        afterBalstCopy.setAnimate({
            quiescence: {x: quiescence.x, y: quiescence.y},
            move: {
                vx: (13 * Math.cos(degree) - 5 * Math.cos(2 * degree) - 2 * Math.cos(3 * degree) - Math.cos(4 * degree)) / 13 * v - 40,
                vy: 16 * Math.pow(Math.sin(degree), 3) / 13 * v
            },
            translate: {
                ax: ((13 * Math.cos(degree) - 5 * Math.cos(2 * degree) - 2 * Math.cos(3 * degree) - Math.cos(4 * degree)) / 13 * v - 40) * -resistance,
                ay: g - resistance * 16 * Math.pow(Math.sin(degree), 3) / 13 * v
            }
        });
        afterBalstCopy.setBase();
        afterBalstList.push(afterBalstCopy);
    }
    firework.setAfterBalstList(afterBalstList);
}

function createEllipseFirework(firework) {
    var inBalst = firework.getInBalst(), num = firework.getNum(), roundness = firework.getRoundness(),
        resistance = firework.getResistance(), afterBalstList = [];
    for (let i = 0; i < num; i++) {
        let afterBalstCopy = AfterBalst.getInstance(), degree = i * 2 * Math.PI / num, animate = inBalst.getAnimate(),
            quiescence = animate.getQuiescence(), v = 20 * (roundness + (1 - roundness) * Math.random());
        afterBalstCopy.setLife(50 + Math.floor(Math.random() * 40));
        afterBalstCopy.setColor(randomColor());
        afterBalstCopy.setAlpha(1);
        afterBalstCopy.setR(2);
        afterBalstCopy.setAnimate({
            quiescence: {x: quiescence.x, y: quiescence.y},
            move: {
                vx: Math.cos(degree) * v * Math.cos(15 * Math.PI / 180) + Math.sin(degree) * v / 4 * Math.sin(15 * Math.PI / 180),
                vy: Math.sin(degree) * v / 4 * Math.cos(15 * Math.PI / 180) - Math.cos(degree) * v * Math.sin(15 * Math.PI / 180)
            },
            translate: {
                ax: (Math.cos(degree) * v * Math.cos(15 * Math.PI / 180) + Math.sin(degree) * v / 4 * Math.sin(15 * Math.PI / 180)) * -resistance,
                ay: g - resistance * (Math.sin(degree) * v / 4 * Math.cos(15 * Math.PI / 180) - Math.cos(degree) * v * Math.sin(15 * Math.PI / 180))
            }
        });
        afterBalstCopy.setBase();
        afterBalstList.push(afterBalstCopy);
    }
    firework.setAfterBalstList(afterBalstList);
}

function createCustomFirework(firework) {
    var inBalst = firework.getInBalst(), roundness = firework.getRoundness(), resistance = firework.getResistance(),
        animate = inBalst.getAnimate(), quiescence = animate.getQuiescence(), afterBalstList = [], custom_g = g / 10,
        denominator = 10, r = 1.5, delay = 0;
    $.each(word, function (index, value) {
        var text = word_matrix[value], num = text.length, position_x = word_position[index * 2],
            position_y = word_position[index * 2 + 1];
        for (let i = 0; i < num; i++) {
            for (let j = 0; j < 9; j++) {
                let point_x = text[i][0], point_y = text[i][1];
                switch (j) {
                    case 0:
                        point_x -= 3.5 / denominator;
                        point_y -= 3.5 / denominator;
                        break;
                    case 1:
                        point_y -= 3.5 / denominator;
                        break;
                    case 2:
                        point_x += 3.5 / denominator;
                        point_y -= 3.5 / denominator;
                        break;
                    case 3:
                        point_x -= 3.5 / denominator;
                        break;
                    case 4:
                        break;
                    case 5:
                        point_x += 3.5 / denominator;
                        break;
                    case 6:
                        point_x -= 3.5 / denominator;
                        point_y += 3.5 / denominator;
                        break;
                    case 7:
                        point_y += 3.5 / denominator;
                        break;
                    case 8:
                        point_x += 3.5 / denominator;
                        point_y += 3.5 / denominator;
                        break;
                    default:
                        break;
                }
                let afterBalstCopy = AfterBalst.getInstance(),
                    range = Math.sqrt(Math.pow(point_x, 2) + Math.pow(point_y, 2)),
                    cos_degree = (range == 0) ? 0 : point_x / range, sin_degree = (range == 0) ? 0 : point_y / range,
                    v = 2 * (roundness + (1 - roundness) * Math.random());
                afterBalstCopy.setDelay(delay);
                afterBalstCopy.setLife(200 + Math.floor(Math.random() * 40));
                afterBalstCopy.setColor(randomColor());
                afterBalstCopy.setAlpha(1);
                afterBalstCopy.setR(r);
                afterBalstCopy.setCustomG(custom_g);
                afterBalstCopy.setAnimate({
                    quiescence: {x: quiescence.x + position_x, y: quiescence.y + position_y},
                    move: {vx: v * range * cos_degree, vy: v * range * sin_degree},
                    translate: {
                        ax: (v * range * cos_degree) * -resistance,
                        ay: custom_g - resistance * (v * range * sin_degree)
                    }
                });
                afterBalstCopy.setBase();
                afterBalstList.push(afterBalstCopy);
            }
        }
        delay += 2;
    });
    firework.setAfterBalstList(afterBalstList);
}

var word = ["黄", "耀", "慧", "生", "日", "快", "乐"];
var word_position = [-250, 0, 0, 0, 300, 0, -375, 250, -125, 250, 125, 250, 375, 250];
var word_matrix = {
    黄: [],
    耀: [],
    慧: [],
    生: [],
    日: [],
    快: [],
    乐: []
};