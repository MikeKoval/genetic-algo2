import {random} from './random';
import {Generation} from './generation';
import {Chromosome} from './chromosome';

type SubscribeFunc = (generation: Generation) => any;
type Range = { from: number, to: number };

export class GeneticAlgorithm {
    public subscribers: SubscribeFunc[] = [];
    public generations: Generation[] = [];
    public currentGeneration: Generation;

    constructor(private populationAmount: number,
                private generationAmount: number,
                private offSpringPercent: number,
                private mutationProbability: number,
                private range: Range,
                private func: (x: number) => number) {

        let firstGeneration = this.generateFirstGeneration();
        this.generations.push(firstGeneration);
        this.currentGeneration = firstGeneration;
    }

    public itarate(){
        if(this.generations.length >= this.generationAmount) return;
        let newGeneration = this.currentGeneration.next();
        this.currentGeneration = newGeneration;
        this.generations.push(newGeneration);
    }

    private generateFirstGeneration(): Generation{
        let chromosomes: Chromosome[] = [];
        for(let i = 0; i < this.populationAmount; i++){
            let x = random(this.range.from, this.range.to);
            let chromosome = new Chromosome(x, this.range, this.mutationProbability, this.func);
            chromosomes.push(chromosome);
        }
        return new Generation(chromosomes, this.offSpringPercent);
    }
}
