import re

def is_valid_french_word(word):
    """检查单词是否只包含法文拉丁字母（包括重音符号）"""
    if not word:
        return False
    
    # 只允许法文拉丁字母（包括重音符号）
    # 不允许数字、连字符、空格、撇号等其他字符
    # 法文拉丁字母范围：a-z, A-Z, 以及带重音的字母
    pattern = r'^[a-zA-ZàâäèéêëîïôöùûüÿæœçÀÂÄÈÉÊËÎÏÔÖÙÛÜŸÆŒÇ]+$'
    
    # 检查是否只包含允许的字符
    if not re.match(pattern, word):
        return False
    
    return True

def filter_dictionary(input_file, output_file):
    """过滤字典文件，只保留合规词汇"""
    valid_words = []
    invalid_count = 0
    
    with open(input_file, 'r', encoding='utf-8') as f:
        for line in f:
            word = line.strip()
            if is_valid_french_word(word):
                valid_words.append(word)
            else:
                invalid_count += 1
    
    with open(output_file, 'w', encoding='utf-8') as f:
        for word in valid_words:
            f.write(word + '\n')
    
    print(f'原始词汇数: {len(valid_words) + invalid_count}')
    print(f'合规词汇数: {len(valid_words)}')
    print(f'不合规词汇数: {invalid_count}')

if __name__ == '__main__':
    input_file = 'French-Dictionary-master/dictionary/dictionary.csv'
    output_file = 'French-Dictionary-master/dictionary/dictionary_filtered.csv'
    filter_dictionary(input_file, output_file)
