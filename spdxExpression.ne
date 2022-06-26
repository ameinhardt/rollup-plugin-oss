@preprocessor typescript

# https://spdx.dev/spdx-specification-21-web-version/#h.jxpfx0ykyb60

MAIN -> COMPOUNDEXPRESSION {% ([expression]) => expression %}
IDSTRING -> ([a-zA-Z]
			| [0-9]
			| "-"
			| "." ):+ {% ([chars]) => chars.join('') %}
LICENSEID -> IDSTRING {% id %}
LICENSEEXCEPTIONID -> IDSTRING {% id %}
LICENSEREF -> ("DocumentRef-" IDSTRING ":"):? "LicenseRef-" IDSTRING
SIMPLEEXPRESSION -> LICENSEID {% ([license]) => ({ license }) %}
					| LICENSEID "+" {% ([license]) => ({ license, plus: true }) %}
					| LICENSEREF {% ([license]) => ({ license }) %}

COMPOUNDEXPRESSION -> SIMPLEEXPRESSION {% ([expression]) => expression %}
					  | SIMPLEEXPRESSION __ "WITH" __ LICENSEEXCEPTIONID {% ([license,, conjuction,, exception]) => ({ ...license, exception}) %}
					  | COMPOUNDEXPRESSION __ ("AND" | "OR") __ COMPOUNDEXPRESSION {% ([left,, [conjunction],, right]) => ({ left, conjunction, right }) %}
					  | "(" _ COMPOUNDEXPRESSION _ ")" {% (expression) => expression[2] %}

_ -> " ":* {% () => null %}
__ -> " ":+ {% () => null %}
