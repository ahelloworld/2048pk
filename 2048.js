class Player2048 {
    constructor(width, height, autoplay, level) {
        this.#ut(0);
        this.#ut(1);
        this.box = document.getElementById('box');
        this.box.innerHTML = '';
        this.pi = 0;
        this.autoplay = autoplay;
        this.disable = false;
        this.width = width;
        this.height = height;
        this.level = level;
        this.array = []
        for (var y = 0; y < height; y++) {
            let line = [];
            let tr = document.createElement('tr');
            for (var x = 0; x < width; x++) {
                let td = document.createElement('td');
                td.pi = -1;
                td.pv = 0;
                line.push(td);
                tr.appendChild(td);
            }
            this.box.appendChild(tr);
            this.array.push(line);
        }
        this.#fillMap(2);
        this.#show();
        this.#listenTouchEvent();
        document.onkeydown = event => { 
            this.#onkeydown(event);
        };
    }
    #doUtCalc(pi, arr1, arr2) {
        let pArr = [];
        arr1.forEach(e => pArr.push({pi: e[0], pv: e[1]}));
        this.#calcLine(pi, pArr);
        for (var i = 0; i < pArr.length; i++) {
            if (pArr[i].pi != arr2[i][0] || pArr[i].pv != arr2[i][1]) {
                console.log(`ut failed, pi ${pi}, test ${arr1}, out ${JSON.stringify(pArr)}, real ${arr2}`);
                return;
            }
        }
    }
    #ut(pi) {
        let pio = pi == 1 ? 0 : 1; 
        this.#doUtCalc(pi, [[pi,2],[pi,2],[-1,0]],[[-1,0],[-1,0],[pi,4]]);
        this.#doUtCalc(pi, [[pi,8],[pi,2],[pi,8]],[[pi,8],[pi,2],[pi,8]]);
        this.#doUtCalc(pi, [[pi,2],[pi,4],[pi,2]],[[pi,2],[pi,4],[pi,2]]);
        this.#doUtCalc(pi, [[pi,2],[-1,0],[pi,2]],[[-1,0],[-1,0],[pi,4]]);
        this.#doUtCalc(pi, [[pi,2],[pio,2],[-1,0]],[[-1,0],[-1,0],[pi,4]]);
        this.#doUtCalc(pi, [[pi,2],[-1,0],[pio,2],[-1,0]],[[-1,0],[pi,2],[pio,2],[-1,0]]);
        this.#doUtCalc(pi, [[pi,2],[pio,4],[-1,0]],[[pi,2],[pio,4],[-1,0]]);
        this.#doUtCalc(pi, [[pio,2],[pi,2],[-1,0]],[[pio,2],[-1,0],[pi,2]]);
        this.#doUtCalc(pi, [[pi,2],[pi,2],[-1,0],[pi,2],[-1,0]],[[-1,0],[-1,0],[-1,0],[pi,2],[pi,4]]);
        this.#doUtCalc(pi, [[pi,2],[pio,4],[-1,0],[pi,2],[-1,0]],[[pi,2],[pio,4],[-1,0],[-1,0],[pi,2]]);
        this.#doUtCalc(pi, [[pi,2],[pio,4],[pi,4],[-1,0],[pi,2],[pi,2],[-1,0]],[[pi,2],[pio,4],[-1,0],[-1,0],[-1,0],[pi,4],[pi,4]]);
        this.#doUtCalc(pi, [[pi,2],[pi,4],[pi,2],[pio,2]],[[-1,0],[pi,2],[pi,4],[pi,4]]);
    }
    #fillMap(count) {
        let empty = [];
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                let td = this.array[y][x];
                if (td.pv != 0) {
                    continue;
                }
                empty.push(td);
            }
        }
        if (empty.length == 0) {
            return;
        }
        let sel = empty.sort(() => 0.5 - Math.random()).slice(0, count);
        for (var i = 0; i < sel.length; i++) {
            sel[i].add = 1;
            sel[i].pv = 2;
            sel[i].pi = this.pi;
        }
    }
    #listenTouchEvent() {
        let body = document.querySelector('body');
        body.addEventListener('touchstart', e => this.#onTouchStart(e));
        body.addEventListener('touchend', e => this.#onTouchEnd(e));
    }
    #onTouchStart(evt) {
        this.startTime = new Date().getTime();
        this.startDistanceX = evt.touches[0].screenX;
        this.startDistanceY = evt.touches[0].screenY;
    }
    #onTouchEnd(evt) {
        if (this.disable) {
            return;
        }
        let endTime = new Date().getTime();
        let endDistanceX = evt.changedTouches[0].screenX;
        let endDistanceY = evt.changedTouches[0].screenY;
        let moveTime = endTime - this.startTime;
        let moveDistanceX = this.startDistanceX - endDistanceX;
        let moveDistanceY = this.startDistanceY - endDistanceY;
        if ((Math.abs(moveDistanceX) > 40 || Math.abs(moveDistanceY) > 40) && moveTime < 500) {
            let next = false;
            if (Math.abs(moveDistanceX) > Math.abs(moveDistanceY)) {
                if (moveDistanceX > 0) {
                    next = this.#left(this.pi, this.array); 
                } else {
                    next = this.#right(this.pi, this.array);
                }
            } else {
                if (moveDistanceY > 0) {
                    next = this.#up(this.pi, this.array);
                } else {
                    next = this.#down(this.pi, this.array);
                }
            }
            if (next) {
                this.disable = true;
                this.#nextWait();
            }
        }
    }
    #onkeydown(evt) {
        if (this.disable) {
            return;
        }
        let next = false;
        switch(evt.keyCode) {
            case 37: next = this.#left(this.pi, this.array); break;
            case 38: next = this.#up(this.pi, this.array); break;
            case 39: next = this.#right(this.pi, this.array); break;
            case 40: next = this.#down(this.pi, this.array); break;
            default:
                return;
        }
        if (next) {
            this.disable = true;
            this.#nextWait();
        }
    }
    #gameEnd() {
        let s = this.#getScore(this.array);
        if (s[0] > s[1]) {
            alert('player 1 win!');
        } else if (s[0] < s[1]) {
            alert('player 2 win!');
        } else {
            alert('standoff!');
        }
    }
    async #nextWait() {
        this.#show();
        await this.#timeout(500);
        this.pi = this.pi == 0 ? 1 : 0;
        this.#show();
        await this.#timeout(500);
        this.#fillMap(2); 
        this.#show();
        if (!this.#canNext()) {
            this.#gameEnd();
            return;
        }
        if (this.autoplay && this.pi == 1) {
            await this.#timeout(500);
            this.#comPlayerDo();
            await this.#nextWait();
        } else {
            this.disable = false;
        }
    }
    #up(pi, array) {
        let rArray = []
        for (var x = 0; x < this.width; x++) {
            let line = []
            for (var y = this.height-1; y >= 0; y--) {
                line.push(array[y][x]);
            }
            rArray.push(line);
        }
        return this.#calc(pi, rArray);
    }
    #down(pi, array) {
        let rArray = []
        for (var x = 0; x < this.width; x++) {
            let line = []
            for (var y = 0; y < this.height; y++) {
                line.push(array[y][x]);
            }
            rArray.push(line);
        }
        return this.#calc(pi, rArray);
    }
    #left(pi, array) {
        let rArray = []
        for (var y = 0; y < this.height; y++) {
            let line = []
            for (var x = this.width-1; x >= 0; x--) {
                line.push(array[y][x]);
            }
            rArray.push(line);
        }
        return this.#calc(pi, rArray);
    }
    #right(pi, array) {
        let rArray = []
        for (var y = 0; y < this.height; y++) {
            let line = []
            for (var x = 0; x < this.width; x++) {
                line.push(array[y][x]);
            }
            rArray.push(line);
        }
        return this.#calc(pi, rArray);
    }
    #calc(pi, array) {
        let change = 0;
        array.forEach(element => change += this.#calcLine(pi, element));
        return change > 0;
    }
    #calcLine(pi, element) {
        let change = 0;
        let end = element.length-1;
        for (var x = element.length-2; x >= 0; x--) {
            let td = element[x];
            if (td.pv == 0 || td.pi != pi) {
                continue;
            }
            let ntd = element[x+1];
            let noadd = false;
            if (td.pv == ntd.pv && ntd.pi != pi) {
                td.pv += ntd.pv;
                ntd.pv = 0;
                ntd.pi = -1;
                noadd = true;
                change = 1;
            }
            let s = end;
            for (var k = x; k <= s; k++) {
                let ktd = element[k];
                if (ktd.pv != 0 && (ktd.pi != pi || ktd.pv != td.pv)) {
                    s = k-1;
                    break;
                }
            }
            for (var k = s; k > x; k--) {
                let ktd = element[k];
                if (ktd.pv == 0) {
                    ktd.pv = td.pv;
                    ktd.pi = td.pi;
                    td.pv = 0;
                    td.pi = -1;
                    if (noadd) {
                        end = k-1;
                    }
                    change = 1;
                } else if (!noadd && ktd.pv == td.pv) {
                    ktd.pv += td.pv;
                    ktd.pi = td.pi;
                    td.pv = 0;
                    td.pi = -1;
                    end = k-1;
                    change = 1;
                }
            }
        }
        return change;
    }
    #show() {
        let pi0Rgb = [0xB0, 0x60, 0x00];
        let pi1Rgb = [0x00, 0x60, 0xB0];
        let piDisable = [0x60, 0x60, 0x60];
        if (this.pi == 0) {
            this.box.style.borderColor = this.#rgb(pi0Rgb[0], pi0Rgb[1], pi0Rgb[2]);
        } else {
            this.box.style.borderColor = this.#rgb(pi1Rgb[0], pi1Rgb[1], pi1Rgb[2]);
        }
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                let td = this.array[y][x];
                if (td.add == 1) {
                    td.style.borderColor = this.#rgb(0x20, 0x80, 0x20);
                    td.style.borderWidth = 4;
                    td.add = 0;
                } else {
                    td.style.borderColor = this.#rgb(0xC0, 0xC0, 0xC0);
                    td.style.borderWidth = 1;
                }
                if (td.pv == 0) {
                    td.innerText = '0';
                    td.style.color = td.style.backgroundColor = this.#rgb(0xFF, 0xFF, 0xFF);
                    continue;
                }
                let c = Math.floor(Math.log2(td.pv)) * 4;
                td.innerText = td.pv;
                td.style.color = this.#rgb(0xE0, 0xE0, 0xE0);
                if (td.pi != this.pi) {
                    td.style.backgroundColor = this.#rgb(piDisable[0] - c, piDisable[1] - c, piDisable[2] - c);
                } else if (td.pi == 0) {
                    td.style.backgroundColor = this.#rgb(pi0Rgb[0] + c, pi0Rgb[1] + c, pi0Rgb[2] + c);
                } else {
                    td.style.backgroundColor = this.#rgb(pi1Rgb[0] + c, pi1Rgb[1] + c, pi1Rgb[2] + c);
                }
            }
        }
        this.#showScore();
    }
    #getScore(array) {
        let p1s = 0;
        let p2s = 0;
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                let td = array[y][x];
                if (td.pi == 0) {
                    p1s += td.pv;
                } else if (td.pi == 1) {
                    p2s += td.pv;
                }
            }
        }
        return [p1s, p2s];
    }
    #getBlock(array) {
        let b1s = 0;
        let b2s = 0;
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                let td = array[y][x];
                if (td.pv == 0) {
                    continue;
                }
                if (td.pi == 0) {
                    b1s += 1;
                } else {
                    b2s += 1;
                }
            }
        }
        return [b1s, b2s];
    }
    #showScore() {
        let r = this.#getScore(this.array);
        document.getElementById('p1s').innerText = r[0];
        document.getElementById('p2s').innerText = r[1];
    }
    #rgb(r, g, b) {
        return 'rgb(' + r + ',' + g + ',' + b + ')';
    }
    #timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    #getArray(array) {
        let sArray = [];
        for (var y = 0; y < this.height; y++) {
            let subArray = [];
            for (var x = 0; x < this.width; x++) {
                subArray.push({
                    pi: array[y][x].pi,
                    pv: array[y][x].pv,
                });
            }
            sArray.push(subArray);
        }
        return sArray;
    }
    #canNext() {
        return this.#left(this.pi, this.#getArray(this.array)) || 
            this.#up(this.pi, this.#getArray(this.array)) || 
            this.#right(this.pi, this.#getArray(this.array)) || 
            this.#down(this.pi, this.#getArray(this.array));
    }
    #getPkScore(pi, array) {
        let s = this.#getScore(array);
        let b = this.#getBlock(array);
        let npi = pi == 0 ? 1 : 0;
        return (s[pi] - s[npi]) * 4 - b[pi];
    }
    #doBestAction(pi, array, deep, peer, show) {
        let r = {};
        let k1 = this.#doDeep(pi, array, this.#left.bind(this), deep, peer, true);
        r[k1] = this.#left.bind(this);
        let k2 = this.#doDeep(pi, array, this.#up.bind(this), deep, peer, true);
        r[k2] = this.#up.bind(this);
        let k3 = this.#doDeep(pi, array, this.#right.bind(this), deep, peer, true);
        r[k3] = this.#right.bind(this);
        let k4 = this.#doDeep(pi, array, this.#down.bind(this), deep, peer, true);
        r[k4] = this.#down.bind(this);
        if (show) { 
            console.log(`left: ${k1}, up: ${k2}, right: ${k3}, down: ${k4}`); 
        }
        r[Math.max(...Object.keys(r))](pi, array);
    }
    #doDeep(pi, array, func, deep, peer, first) {
        let sArray = this.#getArray(array);
        if (!func(pi, sArray)) {
            if (first) {
                return -1000000;
            }
            return this.#getPkScore(pi, sArray);
        }
        if (peer) {
            this.#doBestAction(pi == 0 ? 1 : 0, sArray, 1, false, false);
        }
        deep -= 1;
        if (deep == 0) {
            return this.#getPkScore(pi, sArray);
        }
        let r = [
            this.#doDeep(pi, sArray, this.#left.bind(this), deep, true, false),
            this.#doDeep(pi, sArray, this.#up.bind(this), deep, true, false),
            this.#doDeep(pi, sArray, this.#right.bind(this), deep, true, false),
            this.#doDeep(pi, sArray, this.#down.bind(this), deep, true, false),
        ];
        // console.log(`deep ${deep} do ${func.name} next ${r}`);
        return Math.max(...r);
    }
    #comPlayerDo() {
        this.#doBestAction(this.pi, this.array, this.level, true, false);
        // let sArray = this.#getArray(this.array);
        // this.#doBestAction(this.pi == 0 ? 1 : 0, sArray, 1, false, true);
    }
}
