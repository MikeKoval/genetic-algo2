declare function require(moduleName: string): any;
let vis = require('vis');
import $ = require("jquery");

import { GeneticAlgorithm } from './algorightm';
import { Range } from './types';
import { FitnessFunc } from './chromosome';

type AppConstructorParams = {
    populationLimit: number,
    generationLimit: number,
    offspringPercent: number,
    mutationProbability: number,
    range: Range,
    func: (x: number, y: number) => number,
    canvasId: string,
    canvasId2: string,
    updateTime: number
};

export type DataItem = {
    x: number
    y: number
    z: number
}

export default class App {
    public infoElement: HTMLElement;
    public algorithm: GeneticAlgorithm;

    private populationLimit: number;
    private generationLimit: number;
    private offspringPercent: number;
    private mutationProbability: number;
    private range: Range;
    private func: FitnessFunc;
    private canvasId: string;
    private canvasId2: string;
    private updateTime: number;
    private funcDirtyPoints: DataItem[];
    private funcGraph: any;
    private funcGraph2: any;

    private isStop: boolean = false;

    constructor(params: AppConstructorParams) {
        this.populationLimit = params.populationLimit;
        this.generationLimit = params.generationLimit;
        this.offspringPercent = params.offspringPercent;
        this.mutationProbability = params.mutationProbability;
        this.range = params.range;
        this.func = params.func;
        this.canvasId = params.canvasId;
        this.canvasId2 = params.canvasId2;
        this.updateTime = params.updateTime;

        this.algorithm = new GeneticAlgorithm({
            fitnessFunc: params.func,
            populationAmount: params.populationLimit,
            generationAmount: params.generationLimit,
            offSpringPercent: params.offspringPercent,
            mutationProbability: params.mutationProbability,
            range: params.range
        });
        this.init();
    }

    public start(){
        if(this.isStop || this.algorithm.generations.length >= this.generationLimit) {
            this.isStop = false;
            return
        }
        this.next();
        this.update();
        setTimeout(() => this.start(), this.updateTime);
    }

    public stop(){
        this.isStop = true
    }

    public destroy() {
        this.stop();
        document.body.removeChild(this.infoElement);
        if (this.funcGraph !== undefined) {
            this.initAlgorithmGraph();
        }
        if (this.funcGraph2 !== undefined) {
            this.initFuncGraph();
        }
    }


    private init(){
        this.infoElement = document.createElement('div') as HTMLElement;
        this.infoElement.style.position = 'fixed';
        this.infoElement.style.width = '300px';
        this.infoElement.style.bottom = '20px';
        this.infoElement.style.right = '20px';
        this.infoElement.style.padding = '8px';
        document.body.appendChild(this.infoElement);


        this.initFuncGraph();
        this.initAlgorithmGraph();
    }

    private initFuncGraph(){
        this.funcDirtyPoints = this.calcFuncPoints(this.range);
        const data = new vis.DataSet();

        for (let i = 0; i < this.funcDirtyPoints.length; i++) {
            let item = this.funcDirtyPoints[i];
            data.add({id:i,x:item.x,y:item.y,z:item.z,style:item.z});
        }

        // specify options
        const options = {
            width:  '300px',
            height: '200px',
            style: 'surface',
            showPerspective: true,
            showGrid: true,
            showShadow: false,
            keepAspectRatio: true,
            verticalRatio: 0.5,
        };

        // Instantiate our graph object.
        const container = document.getElementById(this.canvasId);
        this.funcGraph2 = new vis.Graph3d(container, data, options);
    }

    private initAlgorithmGraph(){
        const options = {
            width:  '100%',
            height: '100%',
            style: 'dot',
            xCenter: '50%',
            yCenter: '50%',
            xStep: 2,
            yStep: 2,
            showPerspective: true,
            showGrid: true,
            showShadow: false,
            xBarWidth: 200,
            yBarWidth: 200,
            // zBarWidth: 400,
            yMin: -6,
            yMax: 6,
            xMax: 6,
            xMin: -6,
            zMax: 50,
            zMin: 0,
            keepAspectRatio: false,
            verticalRatio: 0.5,
        };
        const data = new vis.DataSet();
        data.add({id:0,x:0,y:0,z:0,style:0});
        const container = document.getElementById(this.canvasId2);
        this.funcGraph = new vis.Graph3d(container, data, options);
    }

    private update(){
        const chromosomes = this.algorithm.currentGeneration.chromosomes;

        const data = new vis.DataSet();
        let i = 0;
        for(let chromosome of chromosomes){
            data.add({ id: i++, x: chromosome.x, y:chromosome.y, z:chromosome.z, style: chromosome.z  });
        }

        this.funcGraph.setData(data);
        this.funcGraph.redraw();

        this.infoElement.innerText = `Population: #${this.algorithm.generations.length}
            The fittest: ${this.algorithm.currentGeneration.fittest.z}
            Average fit: ${this.algorithm.currentGeneration.averageFitness}
        `;
    }

    private next(){
        this.algorithm.itarate()
    }

    private calcFuncPoints(range: { from: number, to: number}){
        const accurate = 30;
        const data: DataItem[] = [];
        let step = Math.abs(range.to - range.from) / accurate;
        for(let x = range.from; x < range.to; x += step) {
            for(let y = range.from; y < range.to; y += step) {
                let z = this.func(x, y);
                data.push({ x, y, z });
            }
        }
        return data;
    }
}

function init() {
    const form = $('.settings');
    const startBtn = $('#start');
    const stopBtn = $('#stop');

    function objectifyForm(formArray:any) {//serialize data function
        const returnArray:any = {};
        for (let i = 0; i < formArray.length; i++){
            returnArray[formArray[i]['name']] = formArray[i]['value'];
        }
        return returnArray;
    }

    let app: App;
    startBtn.click(() => {
        const data = objectifyForm(form.serializeArray());
        startBtn.prop('disabled', true);
        form.find('input').prop('disabled', true);

        app = new App({
            range: { from: +data.rangeFrom, to: +data.rangeTo },
            func: (x: number, y: number) => 20 + (10 * Math.cos(2 * Math.PI * x) - x ^ 2) + (10 * Math.cos(2 * Math.PI * y) - y ^ 2),
            generationLimit: +data.generationLimit,
            mutationProbability: +data.mutationProbability,
            populationLimit: +data.populationLimit,
            offspringPercent: +data.offspringPercent,
            canvasId: 'chart',
            canvasId2: 'chart2',
            updateTime: +data.updateTime
        });

        app.start();
    });

    stopBtn.click(() => {
        startBtn.prop('disabled', false);
        form.find('input').prop('disabled', false);

        app.destroy();
    });

}

init();