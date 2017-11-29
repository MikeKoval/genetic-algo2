// import * as Plotly from 'plotly.js';
declare function require(moduleName: string): any;
const Plotly = require('plotly.js/lib/index-basic.js');
import $ = require("jquery");

import {GeneticAlgorithm} from './algorightm';
import {Range} from './types';

type AppConstructorParams = {
    populationLimit: number,
    generationLimit: number,
    offspringPercent: number,
    mutationProbability: number,
    range: Range,
    func: (x: number) => number,
    canvasId: string,
    updateTime: number
};

export default class App {
    public infoElement: HTMLElement;
    public algorithm: GeneticAlgorithm;

    private populationLimit: number;
    private generationLimit: number;
    private offspringPercent: number;
    private mutationProbability: number;
    private range: Range;
    private func: (x: number) => number;
    private canvasId: string;
    private updateTime: number;

    private isStop: boolean = false;

    constructor(
        {
            populationLimit,
            generationLimit,
            offspringPercent,
            mutationProbability,
            range,
            func,
            canvasId,
            updateTime
        }: AppConstructorParams
    ) {
        this.populationLimit = populationLimit;
        this.generationLimit = generationLimit;
        this.offspringPercent = offspringPercent;
        this.mutationProbability = mutationProbability;
        this.range = range;
        this.func = func;
        this.canvasId = canvasId;
        this.updateTime = updateTime;

        this.algorithm = new GeneticAlgorithm(populationLimit, generationLimit, offspringPercent, mutationProbability, range, func);
        this.init()
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
        Plotly.purge(this.canvasId);
    }


    private init(){
        this.infoElement = document.createElement('div') as HTMLElement;
        this.infoElement.style.position = 'fixed';
        this.infoElement.style.width = '300px';
        this.infoElement.style.bottom = '20px';
        this.infoElement.style.right = '20px';
        this.infoElement.style.padding = '8px';
        document.body.appendChild(this.infoElement);


        let dirtyPoints = this.calcFuncPoints(this.range);
        Plotly.plot(this.canvasId, [
            {
                x: [0],
                y: [0],
                mode: 'markers'
            },
            {
                x: dirtyPoints.x,
                y: dirtyPoints.y,
                mode: 'lines',
                showlegend: false,
                fill: 'toself',
            }
        ], {
            xaxis: {range: [this.range.from, this.range.to]},
            yaxis: {range: [-100, 100]}
        })


    }

    private update(){
        let chromosomes = this.algorithm.currentGeneration.chromosomes;

        let x: number[] = [];
        let y: number[] = [];
        for(let chromosome of chromosomes){
            x.push(chromosome.x);
            y.push(chromosome.fitness);
        }

        Plotly.animate(this.canvasId, [{
            data: [ { x, y} ],
            traces: [0]
        }], {
            transition: {
                duration: 150,
                easing: 'cubic-in-out'
            }
        });


        this.infoElement.innerText = `Population: #${this.algorithm.generations.length}
            The fittest: ${this.algorithm.currentGeneration.fittest.fitness}
            Average fitness: ${this.algorithm.currentGeneration.averageFitness}
        `;
        console.log('updated');
    }

    private next(){
        this.algorithm.itarate()
    }

    private calcFuncPoints(range: { from: number, to: number}){
        let accurate = 300;
        let xArray: number[] = [range.from];
        let yArray: number[] = [-150];
        let step = Math.abs(range.to - range.from) / accurate;
        for(let i = range.from; i < range.to; i += step) {
            let y = this.func(i);
            xArray.push(i);
            yArray.push(y);
        }
        xArray.push(range.to);
        yArray.push(-150);


        return { x: xArray, y: yArray }
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
            func: (x: number) => (2 - 1.5*x) * Math.sin(1.5*x - 2),
            generationLimit: +data.generationLimit,
            mutationProbability: +data.mutationProbability,
            populationLimit: +data.populationLimit,
            offspringPercent: +data.offspringPercent,
            canvasId: 'chart',
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