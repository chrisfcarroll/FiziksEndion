module FiziksEndion {

  /**
   * @class Vector3 : 3-d vectors of numbers.
   * Statically typed with functions for basic maths operations.
   * Instances of Vector3 are intended to be immutable, so operations return new instances.
   */
  export class Vector3 {
    constructor(public x:number, public y:number, public z:number) {
    }
    magnitudeSquared() {
      return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    magnitude() {
      return Math.sqrt(this.magnitudeSquared());
    }
    direction() {
      var size = this.magnitude();
      return new Vector3(this.x / size, this.y / size, this.z / size);
    }
    timesScalar(scalar:number) {
      return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }
    add(right) {
      return new Vector3(this.x + right.x, this.y + right.y, this.z + right.z);
    }

    /**
     * The zero vector is Vector3(0,0,0);
     */
    static zero = new Vector3(0, 0, 0);

    static sum = function (arrayOfVector3s:Vector3[]) {
      var totalx = 0, totaly = 0, totalz = 0;
      arrayOfVector3s.forEach(function (el) {
        totalx += el.x;
        totaly += el.y;
        totalz += el.z;
      });
      return new Vector3(totalx, totaly, totalz);
    };

  }

}