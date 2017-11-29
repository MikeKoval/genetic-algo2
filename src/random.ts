export function random(min: number, max: number){
    var rand = min + Math.random() * (max + 1 - min);
    return rand % max;
}