import { random } from './random';
import { Generation} from './generation';
import { Chromosome, FitnessFunc } from './chromosome';

type SubscribeFunc = (generation: Generation) => any;
type Range = { from: number, to: number };

export type GeneticAlgorithmParams = {
    populationAmount: number
    generationAmount: number
    offSpringPercent: number
    mutationProbability: number
    fitnessFunc: FitnessFunc
    range: Range
};

export class GeneticAlgorithm {
    public subscribers: SubscribeFunc[] = [];
    public generations: Generation[] = [];
    public currentGeneration: Generation;
    public populationAmount: number;
    public generationAmount: number;
    public offSpringPercent: number;
    public mutationProbability: number;
    public fitnessFunc: FitnessFunc;
    public range: Range;

    constructor(params: GeneticAlgorithmParams) {
        this.populationAmount = params.populationAmount;
        this.generationAmount = params.generationAmount;
        this.offSpringPercent = params.offSpringPercent;
        this.mutationProbability = params.mutationProbability;
        this.fitnessFunc = params.fitnessFunc;
        this.range = params.range;
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
        const chromosomes: Chromosome[] = [];
        for(let i = 0; i < this.populationAmount; i++){
            const x = random(this.range.from, this.range.to);
            const y = random(this.range.from, this.range.to);
            let chromosome = new Chromosome(x, y, this.fitnessFunc, this.range, this.mutationProbability);
            chromosomes.push(chromosome);
        }
        return new Generation(chromosomes, this.offSpringPercent);
    }
}
