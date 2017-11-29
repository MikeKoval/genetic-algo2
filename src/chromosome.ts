import {random} from './random'
import {Range} from './types'

export class Chromosome {
    public fitness: number;

    constructor(public x: number,
                private range: Range,
                private mutationProbability: number,
                private func: (x: number) => number) {
        this.fitness = this.getCost(x)
    }

    public mutate(): Chromosome{
        if(!(Math.random() <= this.mutationProbability)) return this;
        let randNumber = 0.1 * random(this.range.from, this.range.to);
        console.log('---randNumber', randNumber);
        return new Chromosome((this.x + (this.x * randNumber)) % this.range.to, this.range, this.mutationProbability, this.func);
    }

    public mate(partner: Chromosome): Chromosome {
        return new Chromosome((this.x + partner.x)/2, this.range, this.mutationProbability, this.func);
    }

    private getCost(x: number){
        if(x < this.range.from || x > this.range.to) throw new RangeError();
        return this.func(x);
    }

}