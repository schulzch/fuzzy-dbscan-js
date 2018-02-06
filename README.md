# fuzzy-dbscan.js [![NPM version](https://badge.fury.io/js/fuzzy-dbscan.png)](http://badge.fury.io/js/fuzzy-dbscan) 

`fuzzy-dbscan.js` computes [fuzzy clusters](https://en.wikipedia.org/wiki/Fuzzy_clustering) using the FuzzyDBSCAN algorithm [1].

## Installation

Download a [release](https://github.com/schulzch/fuzzy-dbscan-js/releases) or:

    $ npm install fuzzy-dbscan

## Usage

```javascript
import {FuzzyDBSCAN} from 'fuzzy-dbscan';
//Browserify version only, without module loader:
//var FuzzyDBSCAN = global.FuzzyDBSCAN;
```

`FuzzyDBSCAN()` constructs a new instance of the algorithm.
The functions `epsMin(Number)` and `epsMax(Number)` set the fuzzy local neighborhood radius.
`mPtsMin(Number)` and `mPtsMax(Number)` set the fuzzy neighborhood density (number of points).
The `distance(function(a, b))` function defines the distance metric used for clustering.
Once all parameters are set, you can invoke `cluster([...])`.

Note that when setting `epsMin = epsMax` and `mPtsMin = mPtsMax` the algorithm will reduce to classic DBSCAN.
Otherwise the (soft) labels will vary between `0` and `1`.
Moreover, the algorithm distinguishes between `CORE` `NOISE` and `BORDER` points.

## Example

```javascript
var euclideanDistance = function(a, b) {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
};
var fuzzyDBSCAN = new FuzzyDBSCAN().epsMin(10.0).epsMax(20.0).mPtsMin(1).mPtsMax(2).distanceFn(euclideanDistance);

console.log(fuzzyDBSCAN.cluster([{x: 0, y: 0}, {x: 100, y: 100}, {x: 105, y: 105}, {x: 115, y: 115}]));
```

## References

[1] Dino Ienco, and Gloria Bordogna. "Fuzzy extensions of the DBScan clustering algorithm." Soft Computing (2016).

## Versioning

This project is maintained under the [Semantic Versioning](http://semver.org/) guidelines.

## License

Licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). Copyright &copy; 2018 Christoph Schulz.
