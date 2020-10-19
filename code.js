const btn_dibujar = document.getElementById("btn__dibujar");

const canvas = document.getElementById("main__canvas");
const ctx = canvas.getContext("2d");

canvas.style = "margin-top: 20px; border: 4px solid gray;";

const width = parseInt(canvas.width);
const height = parseInt(canvas.height);

const cadenasPrincipales = ["et", "prop", "but", "pent", "hex", "hept", "oct", "non", "dec"];
const subFijos = ["ano", "eno", "ino"];
const ramificaciones = ["metil", " etil", " propil", " butil", "isopropil", "isobutil", "secbutil", "terbutil", "ol", "fenil"];

const casosEspeciales = (compuesto) => {
    let numCarbonos = [];

    //Buscar excepciones
    if (compuesto.includes("eter")){
        numCarbonos.push(4);
        return numCarbonos;
    }
};

const getNumCarbonos = (compuesto) => {

    let numCarbonos = [];

    //Determinar numero de carbonos-enlaces
    numCarbonos.push(3);
    for (let i = 0; i < cadenasPrincipales.length; i++) {
        subFijos.forEach(subFijo => {
            if (compuesto.includes(cadenasPrincipales[i] + subFijo)) {
                for (let j = 1; j < i + 1; j++) {
                    numCarbonos.push(2);
                }
                numCarbonos.push(3);
            }
        });
    }

    //Determinar cuantos enlaces usan las famificaciones
    for (let i = 1; i <= numCarbonos.length; i++) {
        for (let c of compuesto) {
            if (i.toString() === c)
                numCarbonos[i - 1] -= 1;
        }
    }

    //Determinar cuantos enlaces usan los dobles-triples enlaces
    for (let i = 1; i < subFijos.length; i++){
        if (compuesto.includes(subFijos[i])){
            for(let j = compuesto.search(subFijos[i]); j >= 0; j--){
                if (j < 0 || compuesto[j] == '-')
                    break;

                if (compuesto[j] >= '0' && compuesto[j] <= '9'){
                    numCarbonos[parseInt(compuesto[j]) - 1] -= i - 1;
                    numCarbonos[parseInt(compuesto[j])] -= i;
                }
            }
        }
    }

    return numCarbonos;
};

const getCoords = (numCarbonos) => {
    let coordsCarbonos = [];

    let coord = 0;

    coordsCarbonos.push(coord);
    for (let i = 0; i < numCarbonos.length; i++) {
        coord += 20;
        if (numCarbonos[i] >= 2)
            coord += 50;
        else if (numCarbonos[i] == 1)
            coord += 40;
        else
            coord += 20;

        coordsCarbonos.push(coord);
    }

    let displaceX = width / 2 - coord / 2 - 20;
    for (let i = 0; i < coordsCarbonos.length; i++)
        coordsCarbonos[i] += displaceX;

    return coordsCarbonos;
};

const dibujarCadenaPrincipal = (numCarbonos, coordsCarbonos) => {
    for (let i = 0; i < numCarbonos.length; i++) {
        
        if (i != 0)
            ctx.fillRect(coordsCarbonos[i], height / 2 + 12, 20, 3);

        let c_image = new Image();
        c_image.src = `cadena-principal/${numCarbonos[i]}.png`;
        c_image.onload = () => {
            ctx.drawImage(c_image, coordsCarbonos[i] + 20, height / 2);
        };
    }
};

const dibujarRamificaciones = async (compuesto, coordsCarbonos) => {
    //Fijarse que ramificaciones tiene cada compuesto y dibujar dependiendo de la posicion
    ramificaciones.forEach(ramificacion => {
        let up = (Math.random() > 0.5) ? true : false;
        let up_async = up;
        if (compuesto.includes(ramificacion)) {
            for (let i = compuesto.search(ramificacion); i >= 0; i--) {
                if (i < 0 || compuesto[i] == '-')
                    break;

                if (compuesto[i] >= '0' && compuesto[i] <= '9') {

                    const c_image = new Image();
                    c_image.src = `ramificaciones/${ramificacion.replace(' ', '')}${(up) ? 1 : 0}.png`;

                    c_image.onload = () => {
                        const num = parseInt(compuesto[i]);
                        const x_rect = coordsCarbonos[num - 1] + ((coordsCarbonos[num] - (coordsCarbonos[num - 1] + 20)) / 2) + 20;
                        const y_rect = (up_async) ? height / 2 - 40 : height / 2 + 25;

                        ctx.fillRect(x_rect, y_rect, 3, 40);

                        const x = x_rect - c_image.width/2;
                        const y = (up_async) ? height / 2 - 40 - c_image.height : height / 2 + 25 + 40;
                        ctx.drawImage(c_image, x, y);
                        up_async = !up_async;
                    };

                    up = !up;
                }
            }
        }
    });
};

const dibujarEnlances = (compuesto, coordsCarbonos) => {
    //Fijarse que doble-triple enlace tiene cada compuesto y dibujar dependiendo de la posicion
    for (let i = 1; i < subFijos.length; i++){
        if (compuesto.includes(subFijos[i])){
            for(let j = compuesto.search(subFijos[i]); j >= 0; j--){
                if (j < 0 || compuesto[j] == '-')
                    break;

                if (compuesto[j] >= '0' && compuesto[j] <= '9'){
                    const num = parseInt(compuesto[j]);

                    ctx.clearRect(coordsCarbonos[num], height/2, 20, 25);
                    
                    const c_image = new Image();
                    c_image.src = `subfijos/${subFijos[i]}.png`;
                    c_image.onload = () => {
                        ctx.drawImage(c_image, coordsCarbonos[num], height/2);
                    };
                }
            }
        }
    }
};

const dibujarMarcaDeAgua = () => {
    const c_image = new Image();
    c_image.src = 'marca-de-agua.png';
    c_image.onload = () => {
        ctx.drawImage(c_image, width - 255, height - 30);
    };
};

btn_dibujar.addEventListener('click', () => {
    ctx.clearRect(0, 0, width, height);

    const compuesto = document.getElementById("text__compuesto").value;

    let numCarbonos = casosEspeciales(compuesto);

    if (numCarbonos == undefined) numCarbonos = getNumCarbonos(compuesto);

    const coordsCarbonos = getCoords(numCarbonos);

    dibujarCadenaPrincipal(numCarbonos, coordsCarbonos);
    dibujarRamificaciones(compuesto, coordsCarbonos);

    dibujarEnlances(compuesto, coordsCarbonos);

    dibujarMarcaDeAgua();
});