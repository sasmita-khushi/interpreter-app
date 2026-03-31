class Car {
  public name: string = "";
  public year: number;
  private engineNumber: string;

  constructor(name: string, year: number) {
    this.name = name;
    this.year = year;
    this.engineNumber = name + year;

    this.engineStart();
  }

  private engineStart() {
    console.log("starting engine ", this.engineNumber);
  }

  public static newCar(name: string, year: number) {
    let car = new Car(name, year);
    return car;
  }

  //   public start() {
  //     console.log("Starting the car");
  //     this.engineStart();
  //   }
}

let mycar = new Car("bmw", 2025);

let mcar = Car.newCar("meeced", 20026);
