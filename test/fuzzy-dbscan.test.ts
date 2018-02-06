import chai = require('chai');
import seed = require('seed-random');
import PImage = require('pureimage');
import fs = require('fs');
import { FuzzyDBSCAN } from '../src/fuzzy-dbscan';
const should = chai.should();

function euclideanDistance (pointA, pointB) {
  return Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2));
};

function uniformCircle(n, cx, cy, r) {
  var i, j, points, random, ref, t, u, uu;
  random = seed('foobar');
  points = [];
  for (i = j = 0, ref = n; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
    t = 2 * Math.PI * random();
    u = random() + random();
    uu = u > 1 ? 2 - u : u;
    points.push({
      x: cx + r * uu * Math.cos(t),
      y: cy + r * uu * Math.sin(t)
    });
  }
  return points;
};

function dump(filename, points, clusters) {
  var brewer12Paired, cluster, ctx, i, img, j, k, l, len, len1, len2, margin, maxX, maxY, member, minX, minY, point;
  minX = Number.MAX_VALUE;
  minY = Number.MAX_VALUE;
  maxX = Number.MIN_VALUE;
  maxY = Number.MIN_VALUE;
  for (j = 0, len = points.length; j < len; j++) {
    point = points[j];
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }
  margin = 5;
  img = PImage.make(maxX - minX + margin * 2, maxY - minY + margin * 2);
  ctx = img.getContext('2d');
  ctx.fillStyle = '#ffffff';
  brewer12Paired = ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'];
  for (i = k = 0, len1 = clusters.length; k < len1; i = ++k) {
    cluster = clusters[i];
    for (l = 0, len2 = cluster.length; l < len2; l++) {
      member = cluster[l];
      point = points[member.index];
      if (member.cause === 'NOISE') {
        ctx.fillStyle = '#ff00ff';
        ctx.globalAlpha = member.label + 0.25;
      } else {
        ctx.fillStyle = brewer12Paired[i % 12];
        ctx.globalAlpha = member.label + 0.5;
      }
      ctx.fillRect(point.x - minX + margin, point.y - minY + margin, 1, 1);
    }
  }
  console.log('Clusters', clusters, '\nFuzzy-Assigned Indices', [].concat.apply([], clusters).map(function(member) {
    return member.index;
  }).filter(function(value, index, array) {
    return array.indexOf(value) !== index;
  }), '\nClusters #', clusters.map(function(cluster) {
    return cluster.length;
  }), '\n# Points', points.length);
  PImage.encodePNGToStream(img, fs.createWriteStream(filename)).then(function() {
    return console.log('wrote ' + filename);
  })["catch"](function(e) {
    return console.log('failed writing ' + filename);
  });
};

describe('FuzzyDBSCAN', function() {
  describe('hard', function() {
    var points;
    points = [];
    it('should reduce to classic DBSCAN (epsMin = epsMax, mPtsMin = mPtsMax)', function() {
      let fuzzyDBSCAN = new FuzzyDBSCAN().distanceFn(euclideanDistance).epsMin(10.0).epsMax(10.0).mPtsMin(50).mPtsMax(50);
      let clusters = fuzzyDBSCAN.cluster(points);
      clusters.length.should.equal(2);
    });
    it('should reduce to FuzzyBorderDBSCAN (mPtsMin = mPtsMax)', function() {
      let fuzzyDBSCAN = new FuzzyDBSCAN().distanceFn(euclideanDistance).epsMin(10.0).epsMax(20.0).mPtsMin(50).mPtsMax(50);
      console.log(fuzzyDBSCAN);
      let clusters = fuzzyDBSCAN.cluster(points);
      clusters.length.should.equal(2);
    });
    return it('should reduce to FuzzyCoreDBSCAN (epsMin = epsMax)', function() {
      let fuzzyDBSCAN = new FuzzyDBSCAN().distanceFn(euclideanDistance).epsMin(10.0).epsMax(10.0).mPtsMin(1).mPtsMax(100);
      let clusters = fuzzyDBSCAN.cluster(points);
      clusters.length.should.equal(2);
    });
  });
  return describe('fuzzy', function() {
    it('should find fuzzy cores', function() {
      var clusters, fuzzyDBSCAN, points;
      points = [];
      fuzzyDBSCAN = new FuzzyDBSCAN().distanceFn(euclideanDistance).epsMin(10.0).epsMax(10.0).mPtsMin(50).mPtsMax(70);
      clusters = fuzzyDBSCAN.cluster(points);
      return clusters.length.should.equal(2);
    });
    it('should find fuzzy borders', function() {
      var clusters, fuzzyDBSCAN, points;
      points = [];
      fuzzyDBSCAN = new FuzzyDBSCAN().distanceFn(euclideanDistance).epsMin(50.0).epsMax(90.0).mPtsMin(50).mPtsMax(50);
      clusters = fuzzyDBSCAN.cluster(points);
      return clusters.length.should.equal(2);
    });
    return it('should find fuzzy cores and borders', function() {
      var clusters, fuzzyDBSCAN, points;
      points = [];
      fuzzyDBSCAN = new FuzzyDBSCAN().distanceFn(euclideanDistance).epsMin(4.0).epsMax(6.0).mPtsMin(3).mPtsMax(10);
      clusters = fuzzyDBSCAN.cluster(points);
      return clusters.length.should.equal(8);
    });
  });
});
