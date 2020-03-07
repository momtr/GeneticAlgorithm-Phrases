
// Phrases - A Genetic Algorithm
// Moritz Mitterdorfer

// final length of the string
var goalLength;
// the final string
var goalString;
// mutation rate
var mutationRate;
// number of phrases in population
var numberOfPhrases;
// the population of phrases
var population;
// number of current population
var populationCount;
// best phrases
var bestPhrases;

function setup() {
    // we need no Canvas, only DOM-Elements (see p5 DOM libary)
    noCanvas();

    // initialize
    goalString = "Hallo World";
    goalLength = goalString.length;
    mutationRate = 0.08;
    //numberOfPhrases = 450;
    numberOfPhrases = 20000;
    population = new Population(numberOfPhrases);
    populationCount = 0;
    bestPhrases = {};

}

function draw() {
    background(140);

    while(!checkIfFinished())
        population.process();


    // display everything
    removeElements();
    createElement("h1", "Genetic Algorithm");
    createElement("h3", "Goal Phrase: " + goalString);
    createElement("h3", "Population Size: " + numberOfPhrases);
    createElement("h3", "Current Population: " + populationCount);
    createElement("hr");
    createElement("h3", bestPhrases.first);
    createElement("h3", bestPhrases.second);
    createElement("hr");

}

// function for checking if the Genetic Algorithm has finished its task
function checkIfFinished() {
    for(let i = 0; i < population.popu.length; i++) {
        if(population.popu[i].phrase == goalString) {
            console.log("Finished: " + population.popu[i].phrase);
            return true;
        }
            
    }
}




class Phrase {
    constructor(phrase) {
        if(phrase) {
            if(phrase.length != goalLength) 
                console.warn("Please not that your phrase length must be the goalLength of your System!");
            this.phrase = phrase;
        } else {
            this.phrase = getRandomString(goalLength);
        }
    }
    getFitness() {
        // define fitness for each character
        let partPercentage = goalLength != 0 ? 1 / goalLength : 0;
        let fitness = 0;
        for(let i = 0; i < goalString.length; i++) {
            if(goalString[i] === this.phrase[i])
                fitness += partPercentage;
        }
        return fitness;
    }
    mutate() {
        let changes = 0;
        for(let i = 0; i < this.phrase.length; i++) {
            if(random(1) < mutationRate) {
                this.phrase = this.phrase.replaceAt(i, getRandomChar());
                changes++;
            }
        }
        return changes;
    }
}

class Population {
    constructor(number_of_phrases) {
        this.popu = [];
        this.number_of_phrases = number_of_phrases;
        for(let i = 0; i < number_of_phrases; i++) {
            this.popu.push(new Phrase());
        }
    }
    process() {

        // increment population counter
        populationCount++;

        // (1) Select the best two Phrases from the population
        //          - with the use of the fitness function
        //          - parents for Cross-Over

        let firstP;
        let firstP_fitness = 0;
        let secondP;
        let secondP_fitness = 0;
        for(let i = 0; i < this.popu.length; i++) {
            if(this.popu[i].getFitness() > firstP_fitness) {
                firstP = this.popu[i];
                firstP_fitness = this.popu[i].getFitness();
            } else if(this.popu[i].getFitness() > secondP_fitness) {
                secondP = this.popu[i];
                secondP_fitness = this.popu[i].getFitness();
            }
        }
        // clone the object to destroy the object reference
        firstP = cloneObject(firstP);
        secondP = cloneObject(secondP);

        // display the best
        bestPhrases.first = firstP.phrase;
        bestPhrases.second = secondP.phrase;

        console.log(bestPhrases.first);

        // (2) Take the two parents (firstP, secondP) and create two children
        //          ChildA => its phrase => firstP[0-i] + secondP[i-length]
        //          ChildB => its phrase => secondP[0-i] + firstP[i-length]
        //          EXAMPLE:
        //          firstP.phrase == "Haqio"
        //          secondP.phrase == "Hkllu"
        //          ==> 
        //          ChildA.phrase == "Ha"+"llu" == "Hallu"
        //          ChildB.phrase == "Hk"+"qio" == "Hkqio"

        let children = getChildren(firstP, secondP);
        let childA = children.childA;
        let childB = children.childB;

        // (3) Apply the children (childA, childB) to the whole population
        //          - new population =>
        //            [1: childA, 2: childB, 3: childA, 4: childB, ..., n: Child(A/B)]

        this.popu = [];
        for(let i = 0; i < this.number_of_phrases; i++) {
            if(i % 2 === 0) 
                this.popu.push(cloneObject(childA));
            else
                this.popu.push(cloneObject(childB));
        }

        // (4) Mutate the whole population 

        for(let i = 0; i < this.number_of_phrases; i++) {
            this.popu[i].mutate();
        }

    }
}

// function two get two children out of two parents
function getChildren(parentA, parentB) {
    if(parentA.phrase.length != parentB.phrase.length) 
        console.warn("Please not that in getChildren the phrases of both parents should have the same length!");
    let children = {
        childA: undefined,
        childB: undefined,
        randomPoint: undefined
    }
    let randomPoint = Math.floor(random(parentA.phrase.length));
    children.randomPoint = randomPoint;
    childA_string = parentA.phrase.substring(0, randomPoint) + 
                    parentB.phrase.substring(randomPoint, parentA.phrase.length);
    childB_string = parentB.phrase.substring(0, randomPoint) + 
                    parentA.phrase.substring(randomPoint, parentA.phrase.length);
    children.childA = new Phrase(childA_string);
    children.childB = new Phrase(childB_string);
    return children;
}



// function to get a random string & char
function getRandomString(length) {
    let letters = " ABCDEFG HIJKLMNOPQ RSTUVWX YZabcdef ghijklmno pqrstuvwx yz";
    let word = "";
    for(let i = 0; i < length; i++) {
        word += letters[floor(random(letters.length))];
    }
    return word;
}
function getRandomChar() {
    return getRandomString(1);
}
String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
}

// function(s) to clone an object 
function cloneObject(child) {
    return Object.assign(Object.create(Object.getPrototypeOf(child)), child);
}
