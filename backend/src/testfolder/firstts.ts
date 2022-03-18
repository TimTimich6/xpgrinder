// let lucky:number
// lucky = "25";

interface Person {
    first: string,
    last: string,
    [key: string]: any
}

type testPerson = "bool"

const person1: Person = {
    first: "harry",
    last: "obr",
    age: 13
}
const person2: Person = {
    first: "tim",
    last: "obr",
    age: 15
}

function pow(x: number, y: number): string {
    return Math.pow(x, y).toString()
}

const arr: Person[] = []

arr.push(person2)
arr.push(person1)

type MyList = [msg: string,date?: number, tall?: boolean, greeting?: "hi"]
const list: MyList = ["Hi", 2, true];

class Observable<T>{
    constructor(public value:T){

    }
}
let x: Observable<number>

// const testP:testPerson = "hi"

enum Direction1{
    Up,
    Down,
    Left,
    Right,
}
console.log(Direction1.Up)


const cid:any =1
const customerCID = <number>cid
