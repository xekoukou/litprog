# litprog

A literate programming tool. Check the litprog.md file for documentation.

## Installation

```
npm install -g litprog
```

## Help


```
litprog -h
```
```
litprog source_path -ext lang_extension
This program defaults at getting the source code from a single Markdown file.

Options
-html : Get the source code from an html document.
-r : Recursively get the code from all the files of the specified directory that end in '.md' or '.html'.
-lb <string> : Only gets the code blocks that have label <string>.
-h : Show this help page.
```
