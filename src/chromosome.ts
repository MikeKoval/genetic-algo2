import { random } from './random'
import { Range } from './types'

export type FitnessFunc = (x: number, y: number) => number;

export class Chromosome {
    public z: number;

    constructor(public x: number,
                public y: number,
                public fitnessFunc: FitnessFunc,
                private range: Range,
                private mutationProbability: number) {
        this.z = this.getCost(x, y);
    }

    public mutate(): Chromosome {
        if(!(Math.random() <= this.mutationProbability)) return this;
        let randNumber = 0.1 * random(this.range.from, this.range.to);
        const x = (this.x + (this.x * randNumber)) % this.range.to % this.range.from;
        randNumber = 0.15 * random(this.range.from, this.range.to);
        const y = (this.x + (this.y * randNumber)) % this.range.to % this.range.from;

        return new Chromosome(x, y, this.fitnessFunc, this.range, this.mutationProbability);
    }

    public mate(partner: Chromosome): Chromosome {
        const x = (this.x + partner.x) / 2;
        const y = (this.y + partner.y) / 2;

        return new Chromosome(x, y, this.fitnessFunc, this.range, this.mutationProbability);
    }

    private getCost(x: number, y: number) {
        if(x < this.range.from || x > this.range.to || y < this.range.from || y > this.range.to)
            throw new RangeError();

        return this.fitnessFunc(x, y);
    }
}