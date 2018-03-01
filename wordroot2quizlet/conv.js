function getWebText(web_text, web_wordroot){
  const input_dict = {
    "text": web_text,
    "wordroot": web_wordroot,
  }
  return input_dict;
}

function regexRepl(orig_str, regex_str, subst_str) {
  const regex = new RegExp(regex_str, 'g');
  return orig_str.replace(regex, subst_str);
}

function procByLine(line_str) {
  var res_str = line_str;

  // 不在音标框内的逗号，统一为中文逗号，此规则存在疏漏
  res_str = regexRepl(res_str, '([^ \\[])(,|，)[ ]*', '$1，');
  res_str = regexRepl(res_str, '([^\\[])[ ]*(,|，)[ ]*', '$1，');
  // 因替换导致音标框内产生双重逗号的，合并为 / 
  res_str = regexRepl(res_str, '，,', ' / ');
  // 不在音标框内的分号，统一为中文分号
  res_str = regexRepl(res_str, '([^ \\[])(;|；)[ ]*', '$1；');
  // 方括号与括号内的文字之间，增加一个空格
  res_str = regexRepl(res_str, '\\[([^ ])', '[ $1');
  res_str = regexRepl(res_str, '([^ ])\\]', '$1 ]');
  // 单词与音标之间，增加一条 | 竖线
  res_str = regexRepl(res_str, '( \\[[^\\]]+\\]) ', '$1|');

  return res_str;
}

function procByDoc(doc_str) {
  var res_str = doc_str;

  // 移除词根解释框左侧的换行
  res_str = regexRepl(res_str, '[\\r\\n]+([^a-zA-Z])', '$1');
  // 在词根解释框与解释框右侧的内容之间，增加一个半角空格
  res_str = regexRepl(res_str, '\\]([^a-zA-Z| ])', '] $1');
  // 移除音标内容
  res_str = regexRepl(res_str, ' \\[([^\\]]+)\\]\\|', '|');
  // 词根解释框改为中文圆括号，并将词义与词根解释位置对调
  res_str = regexRepl(res_str, '\\[([^\\]]+)\\] ([^\r\n]+)', '*$2*\r\n（$1）##');
  // 移除所有中文字符之间的空格
  res_str = regexRepl(res_str, '([^a-zA-Z0-9\\[\\]\\|，,]) ([^a-zA-Z0-9\\[\\]\\|，,])', '$1$2');
  // 杂项替换：左括号，右单引号
  res_str = regexRepl(res_str, '（ ', '（');
  res_str = regexRepl(res_str, '’', '“');
  // 词根替换
  // res_str = regexRepl(res_str, '([a-z]*)pon([a-z]*)\\|', '$1*pon*$2|');
  // res_str = regexRepl(res_str, '([a-z]*)fac([a-z]*)\\|', '$1*fac*$2|');

  return res_str;
}

function text2QuizletCsv(text) {
  var doc_str = "";
  var line_str_array = text.split("\n");  
  for (var idx = 0; idx < line_str_array.length; idx++) {
    line_str_array[idx] = procByLine(line_str_array[idx]);
  }
  doc_str = line_str_array.join("\n");
  return procByDoc(doc_str);
}
