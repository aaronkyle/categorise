# Testing Generators


```js echo
const genCell = view(Inputs.input())
```

```js echo
genCell.value
```

```js echo
const anotherGenCellElement = Inputs.input()
display(anotherGenCellElement)
```

```js echo
const anotherGenCell = Generators.input(anotherGenCellElement)
display(anotherGenCell)
```

```js echo
display(anotherGenCell)
```


```js echo
const someValue = anotherGenCell;
display(someValue)
```