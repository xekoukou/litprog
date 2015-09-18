# litprog

**litprog** is a tool that helps programmers put the code of the program inside the documentation of the program. What it does is to extract all code pieces from the documents and join them together to make the complete source code.

One needs to point out that it is helfull if the programming language permits functions to be called before they are defined. That way, the document is not forced to follow the sequence that the source code demands.

There are multiple usecases for such a tool. The documentation can be inside an html document. That documnet could contain other things that supplement the exposition of the documentation like dynamic charts with the use of javascript (example here). In other cases, it can simply be a mardown file. Thus , one needs to specify if we deal with html documents or markdown files. 

Moreover, one could generate the documentation of the whole project recusively or one might like to perform custom actions between each generation. Thus we allow someone to specify a directory and recursively generate the source code for each file or specify a single file.

```
#!/usr/bin/env node

var recursively = false;
var html = false;
var ext = null;
var help = false;
var source_path = null;

for (var i = 2; i <process.argv.length; i++) {
    var arg = process.argv[i];
    switch (arg) {
      case "-r": {
        recursively = true;
        break;
        }
      case "-html": {
        html = true;
        break;
        }
      case "-h": {
        help = true;
        break;
        }
      case "-ext": {
        ext = process.argv[i+1];
        i++;
        break;
        }
      default: {
        source_path = arg;
        }
    }
}

if (source_path == null || ext == null || help == true) {
  console.log("\nlitprog options source_path -ext lang_extension\n\nThis program defaults at generating the source code of a single Markdown file.\nTo change that behaviour, use the different options.\n\nOptions\n\n-html : Generate the source code from an html document.\n-r : Recursively generate all the files of the specified directory that end in '.md' or '.html'.\n-h : Show this help page.\n");
process.exit(0);
}
```

If it is an html document, we need to get all the parts that are markdown documentation. We get all divs that have the 'markdown class'. We use the cheerio library for that.

```
var cheerio = require('cheerio');

function extract_markdown_from_html(cheerio,file) {
  var $ = cheerio.load(file);
  var documentation = "";
  $("div.markdown").each(function(){
    documentation += $(this).text();
  });
  return documentation;
}
```

Then we extract the code from the markdown document.

```
function extract_code_from_markdown(markdown) {
  var code = "";
  var temp = markdown.split("\`\`\`\n");
  for(var i = 1; i < temp.length; i = i+2) {
    code +=temp[i]; 
  }
  return code;
}
```

Here we load a single file and report an error if it doesn't exists.

```
var fs = require("fs");
function load_file(path) {
  var file;
  try {
    file = fs.readFileSync(path, { encoding: "utf-8" });
  } catch(e) {
    console.log("The file at '"+path+"' appears to not exist.");
    process.exit(0);
  }
  return file;
}
```

The remaining code deals with the different options.

```
function extract_single_file(path,html,ext) {

  var is_html = path.slice(-4) == "html";
  var is_md = path.slice(-2) == "md";
  if((html !=is_html) || !(is_html || is_md)) {
    return;
  } else {
    var file = load_file(path);
    var markdown;
    var path_to_save;
    if(html) {
      path_to_save = path.slice(0,-5);
      markdown = extract_markdown_from_html(cheerio,file); 
    } else {
      path_to_save = path.slice(0,-3);
      markdown = file;
    }

    var code = extract_code_from_markdown(markdown);
    fs.writeFileSync(path_to_save + ext,code);
  }
}

if(recursively) {
  function dir_rec(cpath) {
    var files = fs.readdirSync(cpath);
    files.forEach(function(file){
      var stat = fs.statSync(cpath + "/" + file);
      if(stat.isDirectory()) {
        dir_rec(cpath + "/" + file);
      } else {
        extract_single_file(source_path,html,ext);
      }
    });
  }
  dir_rec(source_path);
} else {
  extract_single_file(source_path,html,ext);
}
```
