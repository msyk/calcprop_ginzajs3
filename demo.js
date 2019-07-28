const parser = require('inter-mediator-expressionparser')
const nodegraph = require('inter-mediator-nodegraph')

let exp, vals, i, elements

exp = 'a+b'
vals = {a: 3, b: 4}
console.log(parser.evaluate(exp, vals)) // --> 7

exp = 'substr(s, start, len)'
vals = {s: 'Here Comes the Sun.', start: 5, len: 4}
console.log(parser.evaluate(exp, vals)) // --> Come

exp = 'if(value=\'\', 0, value)'
console.log(parser.evaluate(exp, {value: 48})) // --> 48
console.log(parser.evaluate(exp, {value: ''})) // --> 0

/*
  x = a + b
  y = a * b
  z = x - y
*/
vals = {a: 3, b: 4}
exps = [{result: 'x', exp: 'a+b'},{result: 'y', exp: 'a*b'},{result: 'z', exp: 'x-y'}]
for (i = 0 ; i < exps.length ; i++){
  vals[exps[i].result] = parser.evaluate(exps[i].exp, vals)
  console.log(vals)
}
/* -->
{ a: 3, b: 4, x: 7 }
{ a: 3, b: 4, x: 7, y: 12 }
{ a: 3, b: 4, x: 7, y: 12, z: -5 }
*/

// Different order

vals = {a: 3, b: 4}
exps = [{result: 'z', exp: 'x-y'},{result: 'x', exp: 'a+b'},{result: 'y', exp: 'a*b'}]
/*
for (i = 0 ; i < exps.length ; i++){
  vals[exps[i].result] = parser.evaluate(exps[i].exp, vals)
  console.log(vals)
}
*/
/* -->
Error: undefined variable: x
*/

nodegraph.clear()
vals = {a: 3, b: 4}
exps = {z: 'x-y', x: 'a+b', y: 'a*b'}
for (key in exps){
  elements = parser.parse(exps[key]).variables()
  for (i = 0 ; i < elements.length ; i++){
    nodegraph.addEdge(key, elements[i])
  }
}
do {
  leafNodes = nodegraph.getLeafNodesWithRemoving()
  for (i = 0; i < leafNodes.length; i++) {
    if(Object.keys(vals).indexOf(leafNodes[i])<0){
      vals[leafNodes[i]] = parser.evaluate(exps[leafNodes[i]], vals)
    }
  }
  console.log(leafNodes, '>>>', vals)
} while (leafNodes.length > 0)
/*
[ 'a', 'b' ] '>>>' { a: 3, b: 4 }
[ 'x', 'y' ] '>>>' { a: 3, b: 4, x: 7, y: 12 }
[ 'z' ] '>>>' { a: 3, b: 4, x: 7, y: 12, z: -5 }
[] '>>>' { a: 3, b: 4, x: 7, y: 12, z: -5 }
*/
