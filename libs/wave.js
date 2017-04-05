var gerstner_pt_a = [
	0.0,0.0, 41.8,1.4, 77.5,5.2, 107.6,10.9,
	132.4,17.7, 152.3,25.0, 167.9,32.4, 179.8,39.2,
	188.6,44.8, 195.0,48.5, 200.0,50.0
];
var gerstner_pt_b = [
	0.0,0.0, 27.7,1.4, 52.9,5.2, 75.9,10.8,
	97.2,17.6, 116.8,25.0, 135.1,32.4, 152.4,39.2,
	168.8,44.8, 184.6,48.5, 200.0,50.0
];
var wave_para = [
	[	1.6,	0.12,	0.9,	0.06,	0.0,	0.0	],
	[	1.3,	0.1,	1.14,	0.09,	0.0,	0.0	],
	[	0.2,	0.01,	0.8,	0.08,	0.0,	0.0	],
	[	0.18,	0.008,	1.05,	0.1,	0.0,	0.0	],
	[	0.23,	0.005,	1.15,	0.09,	0.0,	0.0	],
	[	0.12,	0.003,	0.97,	0.14,	0.0,	0.0	]
];

var gerstner_sort = [
	0, 0, 1, 1, 1, 1
];

const START_X		= -4.0;
const START_Y		= -2.5;
const START_Z		= 0;
const LENGTH_X		= 0.1;
const LENGTH_Y		= 0.1;

const HEIGHT_SCALE	= 1.6;

const WAVE_COUNT	= 6;

const STRIP_COUNT	= 50;
const STRIP_LENGTH	= 50;
const DATA_LENGTH	= STRIP_LENGTH*2*(STRIP_COUNT-1);

var pt_strip=[];
var pt_normal=[];
var vertex_data=[];
var normal_data=[];

var Wave = function(){
	this.wave_count=0;
	this.time=0.0;
	this.wave_length=[];
	this.wave_height=[];
	this.wave_dir=[];
	this.wave_speed=[];
	this.wave_start=[];    
}
var waves = new Wave();
var initWave = function()
{
	
	for(var w=0; w<WAVE_COUNT; w++)
	{
		waves.wave_length[w] = wave_para[w][0];
		waves.wave_height[w] = wave_para[w][1];
		waves.wave_dir[w] = wave_para[w][2];
		waves.wave_speed[w] = wave_para[w][3];
		waves.wave_start[w*2] = wave_para[w][4];
		waves.wave_start[w*2+1] = wave_para[w][5];
	}

	//Initialize pt_strip[]
	var index=0;
	for(var i=0; i<STRIP_COUNT; i++)
	{
		for(var j=0; j<STRIP_LENGTH; j++)
		{
			pt_strip[index] = START_X + i*LENGTH_X;
			pt_strip[index+1] = START_Y + j*LENGTH_Y;
			index += 3;
		}
	}
}

var calculWave=function()
{
	var index=0;
	var d, wave;
	for(var i=0; i<STRIP_COUNT; i++)
	{
		for(var j=0; j<STRIP_LENGTH; j++)
		{
			wave = 0.0;
			for(var w=0; w<WAVE_COUNT; w++){
				d = (pt_strip[index] - waves.wave_start[w*2] + (pt_strip[index+1] - waves.wave_start[w*2+1]) * Math.tan(waves.wave_dir[w])) * Math.cos(waves.wave_dir[w]);
				if(gerstner_sort[w] == 1){
					wave += waves.wave_height[w] - gerstnerZ(waves.wave_length[w], waves.wave_height[w], d + waves.wave_speed[w] * waves.time, gerstner_pt_a);
				}else{
					wave += waves.wave_height[w] - gerstnerZ(waves.wave_length[w], waves.wave_height[w], d + waves.wave_speed[w] * waves.time, gerstner_pt_b);
				}
			}
			pt_strip[index+2] = START_Z + wave*HEIGHT_SCALE;
			index += 3;
		}
	}


	index = 0;
	for(var i=0; i<STRIP_COUNT; i++)
	{
		for(var j=0; j<STRIP_LENGTH; j++)
		{
			var p0 = index-STRIP_LENGTH*3, p1 = index+3, p2 = index+STRIP_LENGTH*3, p3 = index-3;
			var xa, ya, za, xb, yb, zb;
			if(i > 0){
				if(j > 0){
					xa = pt_strip[p0] - pt_strip[index], ya = pt_strip[p0+1] - pt_strip[index+1], za = pt_strip[p0+2] - pt_strip[index+2];
					xb = pt_strip[p3] - pt_strip[index], yb = pt_strip[p3+1] - pt_strip[index+1], zb = pt_strip[p3+2] - pt_strip[index+2];
					pt_normal[index] += ya*zb-yb*za;
					pt_normal[index+1] += xb*za-xa*zb;
					pt_normal[index+2] += xa*yb-xb*ya;
				}
				if(j < STRIP_LENGTH-1){
					xa = pt_strip[p1] - pt_strip[index], ya = pt_strip[p1+1] - pt_strip[index+1], za = pt_strip[p1+2] - pt_strip[index+2];
					xb = pt_strip[p0] - pt_strip[index], yb = pt_strip[p0+1] - pt_strip[index+1], zb = pt_strip[p0+2] - pt_strip[index+2];
					pt_normal[index] += ya*zb-yb*za;
					pt_normal[index+1] += xb*za-xa*zb;
					pt_normal[index+2] += xa*yb-xb*ya;
				}
			}
			if(i < STRIP_COUNT-1){
				if(j > 0){
					xa = pt_strip[p3] - pt_strip[index], ya = pt_strip[p3+1] - pt_strip[index+1], za = pt_strip[p3+2] - pt_strip[index+2];
					xb = pt_strip[p2] - pt_strip[index], yb = pt_strip[p2+1] - pt_strip[index+1], zb = pt_strip[p2+2] - pt_strip[index+2];
					pt_normal[index] += ya*zb-yb*za;
					pt_normal[index+1] += xb*za-xa*zb;
					pt_normal[index+2] += xa*yb-xb*ya;
				}
				if(j < STRIP_LENGTH-1){
					xa = pt_strip[p2] - pt_strip[index], ya = pt_strip[p2+1] - pt_strip[index+1], za = pt_strip[p2+2] - pt_strip[index+2];
					xb = pt_strip[p1] - pt_strip[index], yb = pt_strip[p1+1] - pt_strip[index+1], zb = pt_strip[p1+2] - pt_strip[index+2];
					pt_normal[index] += ya*zb-yb*za;
					pt_normal[index+1] += xb*za-xa*zb;
					pt_normal[index+2] += xa*yb-xb*ya;
				}
			}
			// normalizeF(pt_normal[index], pt_normal[index], 3);
				

			index += 3;
		}
	}


	var pt;
	for(var c=0; c<(STRIP_COUNT-1); c++)
	{
		for(var l=0; l<2*STRIP_LENGTH; l++)
		{
			if(l%2 == 1){
				pt = c*STRIP_LENGTH + Math.floor(l/2);
			}else{
				pt = c*STRIP_LENGTH + Math.floor(l/2) + STRIP_LENGTH;
			}
			index = STRIP_LENGTH*2*c+l;
			for(var i=0; i<3; i++){
				vertex_data[index*3+i] = pt_strip[pt*3+i];
				normal_data[index*3+i] = pt_normal[pt*3+i];
			}
		}
	}

	// for(var c=0; c<(STRIP_COUNT-1); c++)
	// 	glDrawArrays(GL_TRIANGLE_STRIP, STRIP_LENGTH*2*c, STRIP_LENGTH*2);


}

var gerstnerZ=function(w_length, w_height, x_in, gerstner)
{
	x_in = x_in * 400.0 / w_length;
 
	while(x_in < 0.0)
		x_in += 400.0;
	while(x_in > 400.0)
		x_in -= 400.0;
	if(x_in > 200.0)
		x_in = 400.0 - x_in;
 
	var i = 0;
	var yScale = w_height/50.0;
	while(i<18 && (x_in<gerstner[i] || x_in>=gerstner[i+2]))
		i+=2;
	if(x_in == gerstner[i])
		return gerstner[i+1] * yScale;
	if(x_in > gerstner[i])
		return ((gerstner[i+3]-gerstner[i+1]) * (x_in-gerstner[i]) / (gerstner[i+2]-gerstner[i]) + gerstner[i+3]) * yScale;
}

var getWateStrip = function()
{
	initWave();
	calculWave();
	// console.log(vertex_data);
	
	// var xx= [-0.5, 0.0,  0.0, +0.5,  0.0, 0.0,
 //      +0.5, +0.5,  +0.5, 0.0,  +1.0, 0.5];
	return vertex_data;
}