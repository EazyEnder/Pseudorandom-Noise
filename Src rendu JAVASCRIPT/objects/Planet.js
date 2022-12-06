//Masse and Radius > Height / relief
//Distance > Gaz / Telluric and Composition
//Distance & Masse > Atmosphere > Albedo > Temperature 
//Temperature > Biomes and texture

let noise_resolution = 6;
let height_wished = 150;

export class Planet{
    constructor(name,masse,radius,distance,temperature,composition){
        this.name = name;
        this.masse = masse;
        this.radius = radius;
        this.distance = distance;
        this.temperature = temperature;
        this.composition = composition;
    }
    
    createMesh(geometry,geometry_clouds){
        GenerateTexture(geometry,geometry_clouds)
    }

    GenerateTexture(geometry,geometry_clouds){
        const geo_counts = geometry.attributes.position.count;

        let colorlist = getColorByName("Earth");

        for (var i = 0; i < geo_counts; i++) {

            let x = geometry.attributes.position.getX(i);
            let y = geometry.attributes.position.getY(i);
            let z = geometry.attributes.position.getZ(i);
        
            let dh = this.ComputePlanetNoise(x, y, z,20);
            z += 0;

            let modif = 0.02;
            let pos_norm = Math.sqrt(Math.pow(x,2)+Math.pow(y,2)+Math.pow(z,2));
            if(dh < 0){dh = 0;}
            let vect = [x/pos_norm * dh,y/pos_norm * dh,z/pos_norm * dh];
        
            let variation_color = Math.round(Math.random() * 10 - 5);

            colorlist.forEach(color => {
                if(dh > height_wished * color[0] || (isNaN(dh) && color[0] == -Infinity)){
                    geometry.attributes.color.setXYZ(i, (color[1] + variation_color) / 255, (color[2] + variation_color) / 255, (color[3] + variation_color) / 255);
                }
            });

            // if (dh > height_wished / 35) {
            //     geometry.attributes.color.setXYZ(i, (211 + variation_color) / 255, (211 + variation_color) / 255, (211 + variation_color) / 255);
            // }
            // else if (dh > height_wished / 75) {
            //     geometry.attributes.color.setXYZ(i, (104 + variation_color) / 255, (104 + variation_color) / 255, (104 + variation_color) / 255);
            // } else if (dh > height_wished / 300) {
            //     variation_color -= 60 * noise.perlin2(x * 0.25, y * 0.25);
            //     geometry.attributes.color.setXYZ(i, (47 + variation_color) / 255, (81 + variation_color) / 255, (33 + variation_color) / 255);
            // } else if (dh > height_wished / 500) {
            //     geometry.attributes.color.setXYZ(i, (85 + variation_color) / 255, (122 + variation_color) / 255, (224 + variation_color) / 255);
            // } else {
        
            //     variation_color += 25 * noise.perlin2(x * 0.25, y * 0.25);
        
            //     geometry.attributes.color.setXYZ(i, (37 + variation_color) / 255, (72 + variation_color) / 255, (160 + variation_color) / 255);
            // }
        
        
        
            if(vect[0] != NaN && vect[1] != NaN && vect[2] != NaN){
                geometry.attributes.position.setXYZ(i, x+vect[0]*modif, y+vect[1]*modif, z+vect[2]*modif);
            }else{
                geometry.attributes.position.setXYZ(i, x, y, z);
            }
        
        }
    }

    ComputePlanetNoise(x, y, z, height_wished) {

        const octaves = noise_resolution;
        //default: 3
        const lacunarity = 3;
        //dflt : 2
        const exponentiation = 2 * this.masse / (6*Math.pow(10,24));
        const persistance = 0.4 * Math.pow(this.masse / (6*Math.pow(10,24)),-1);

        const xs = x / 7;
        const ys = y / 7;
        const zs = z / 7;
        let amplitude = 1;
        let frequency = 10;
    
        let normalization = amplitude;
        let total = 0;
    
        for (let o = 0; o < octaves; o++) {
    
            let noiseValue = -1 * Math.abs(noise.perlin3(xs * frequency, ys * frequency, zs * frequency)) + 0.5;
            noiseValue = Number.parseFloat(noiseValue.toPrecision(1))
            total += noiseValue * amplitude;
            normalization += amplitude;
            amplitude *= persistance;
    
            frequency *= lacunarity;
    
        }
    
        total /= normalization;
    
        total = Math.pow(total, 1) * height_wished;
        total += Math.pow(this.masse / (6*Math.pow(10,24)) * noise.perlin3(xs * 5, ys * 5, zs * 5) * amplitude * height_wished, 3);
        
    
        return total;
    }
    
}

function generatePlanet(){

}

// [Name,[height, R, G, B],...]
let mapColorHeight = 
[
    ["Earth",[1/35, 211, 211, 211],[1/75, 104, 104, 104],[1/300,47,81,33],[1/500,85,122,224],[-Infinity,37,72,160]],
    ["Desert",[1/35, 127, 113, 64],[1/75, 137, 123, 74],[1/300,173,151,74],[1/500,168,150,84],[-Infinity,193,172,96]],
    ["Artic",[1/35, 140, 150, 150],[1/75, 162, 166, 166],[1/300,180,185,185],[1/500,210,213,213],[-Infinity,231,231,231]],
    ["Steel",[1/35, 170, 20, 20],[1/75, 120, 20, 20],[1/300,50,50,50],[1/500,70,70,70],[-Infinity,80,80,80]]
];

function getColorByName(name){
    let palchoose;
    mapColorHeight.forEach(palette => {
        if(palette[0] == name) {
            let palcopy = palette.slice();
            palcopy.shift();
            palchoose=palcopy;
        }
    });
    return palchoose.reverse();
}