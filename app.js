cdmi = require('fs').readFileSync('example.cdmi', 'utf8')

Array.prototype.safeshift = function(cnt) {
	for(let i = 0; i < (cnt || 1); i++) {
		delete this[0]
		this.shift()
	}
}
Array.prototype.add = function(item) {
	return this[this.length] = item
}

parse = (cdmi) => {
	let token = '', root = {}, stack = [root, [root]]
	setVal = (begin) => {
		if((stack[0].name != 'desc') && (stack[0].type != 'block')) // BUG
			token = token.split(' ')
		if(begin)
			stack[0].type = stack[0].name ? 'nest' : 'block'
		else if(!Object.keys(stack[0]).length && stack[1][stack[1].length - 2]) {
			stack[1].pop()
			stack[1][stack[1].length - 1].val.push(token)
			token = ''
			return
		}
		stack[0].val = [token]
		token = ''
	}
	for(let i = 0; i < cdmi.length, ch = cdmi[i]; i++) {
		switch(ch) {
			case '=':
			case ':':
				if(token[token.length - 1] == ' ') token = token.slice(0, -1)
				stack[0].name = token
				token = ''
				break
			
			case '(':
			case '[':
			case '{':
				if(token[token.length - 1] == ' ') token = token.slice(0, -1)
				setVal(true)
				stack[0].params = [{}]
				stack.unshift(stack[0].params[0], stack[0].params)
				break

			case '\n':
				if(!token) break // not an empty line
			case ',':
				setVal(false)
				stack.safeshift()
				stack.unshift(stack[0].add({}))
				break

			case ')':
			case ']':
			case '}':
				if(token) setVal(false)
				stack.safeshift(3)
				stack.unshift(stack[0].add({}))
				break
			
			case '#': while(cdmi[i++] != '\n');
			case '\t':
			case ' ':
				if(!token && token[token.length-1] != ' ')
				break
			
			default: token += ch
		}
	}
	return stack[1]
}

let exp = parse(cdmi)
console.dir(exp, {depth: null})