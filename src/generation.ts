import {Chromosome} from './chromosome';
import {random} from './random';

export class Generation {
    constructor(public chromosomes: Chromosome[], private offSpringPercent: number) {

    }

    public get averageFitness(){
        let sum = 0;
        this.chromosomes.forEach(c => sum += c.fitness);
        return sum / this.chromosomes.length;
    }

    public get fittest(): Chromosome{
        let fittest: Chromosome = null;
        for(let c of this.chromosomes){
            if(!fittest || fittest.fitness < c.fitness) fittest = c;
        }
        return fittest;
    }

    next(){
        let childAmount = Math.floor(this.chromosomes.length * this.offSpringPercent);
        if(childAmount > this.chromosomes.length) throw new RangeError('Child percent is too big.');

        this.chromosomes.sort((a, b) => b.fitness - a.fitness);

        let childs: Chromosome[] = [];
        for(let i = 0; i < childAmount; i++){

            let parent1Index = Math.floor(random(0, this.chromosomes.length));
            let parent2Index = Math.floor(random(0, this.chromosomes.length));
            let parent3Index = Math.floor(random(0, this.chromosomes.length));
            let parent4Index = Math.floor(random(0, this.chromosomes.length));
            let partner1 = this.chromosomes[parent1Index],
                partner2 = this.chromosomes[parent2Index],
                partner3 = this.chromosomes[parent3Index],
                partner4 = this.chromosomes[parent4Index];

            let partners = [partner1, partner2, partner3, partner4].sort((a, b) => b.fitness - a.fitness);
            // let partner1 = this.chromosomes[i]
            // let partner2 = this.chromosomes[(i + 1) % this.chromosomes.length]
            // let child1: Chromosome = partner1.mate(partner2)
            let child1: Chromosome = partners[0].mate(partners[1]);
            childs.push(child1)
        }

        this.chromosomes.splice(this.chromosomes.length - childAmount, childAmount, ...childs);
        let chromosomes = this.chromosomes.map(chromosome => chromosome.mutate());
        return new Generation(chromosomes, this.offSpringPercent);
    }
}