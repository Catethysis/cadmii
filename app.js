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
		if(token[0] == '_') {
			token = token.substring(1)
			stack[0].hidden = true
		}
		stack[0].val = token
		token = ''
		if(begin)
			stack[0].type = stack[0].name ? 'nest' : 'block'
	}
	for(let i = 0; i < cdmi.length, ch = cdmi[i]; i++) {
		switch(ch) {
			case '=':
			case ':':
				if(token[0]=='.') {
					token = token.substring(1)
					stack[0].pin = true
				}
				stack[0].name = token
				token = ''
				break
			
			case '(':
			case '[':
			case '{':
				setVal(true)
				stack[0].params = [{}]
				stack.unshift(stack[0].params[0], stack[0].params)
				break

			case '\n':
				if(!token) break // not an empty line
			case ',':
				setVal()
				stack.safeshift()
				stack.unshift(stack[0].add({}))
				break

			case ')':
			case ']':
			case '}':
				if(token) setVal()
				stack.safeshift(3)
				stack.unshift(stack[0].add({}))
				break
			
			case '#': while(cdmi[i++] != '\n');
			case '\t':
			case ' ':
				break
			
			default: token += ch
		}
	}
	return stack[1]
}

let exp = parse(cdmi)
console.dir(exp, {depth: null})