import re

def is_valid_french_word(word):
    """检查单词是否只包含法文拉丁字母（包括重音符号）且不是缩写词"""
    if not word:
        return False
    
    # 只允许法文拉丁字母（包括重音符号）
    # 不允许数字、连字符、空格、撇号等其他字符
    # 法文拉丁字母范围：a-z, A-Z, 以及带重音的字母
    pattern = r'^[a-zA-ZàâäèéêëîïôöùûüÿæœçÀÂÄÈÉÊËÎÏÔÖÙÛÜŸÆŒÇ]+$'
    
    # 检查是否只包含允许的字符
    if not re.match(pattern, word):
        return False
    
    # 过滤缩写词：全大写的单词（如 ABS, ACL, ADN, AM, API 等）
    if word.isupper():
        return False
    
    # 过滤缩写词：以大写字母开头，中间有大写字母，最后以小写字母结尾的单词（如 AFMs, AOCs, ASBLs）
    # 这种模式通常是缩写加复数形式
    if len(word) > 2:
        # 检查是否包含大写字母序列（两个或以上连续大写字母）
        has_upper_sequence = False
        upper_count = 0
        for char in word:
            if char.isupper():
                upper_count += 1
                if upper_count >= 2:
                    has_upper_sequence = True
                    break
            else:
                upper_count = 0
        
        # 如果包含大写字母序列且不是全大写，则可能是缩写
        if has_upper_sequence and not word.isupper():
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
    
    # 打印被过滤掉的缩写词示例
    print('\n被过滤的缩写词示例（前20个）：')
    with open(input_file, 'r', encoding='utf-8') as f:
        count = 0
        for line in f:
            word = line.strip()
            if word and (word.isupper() or (len(word) > 1 and word[1:].isupper())):
                if count < 20:
                    try:
                        print(f'  - {word}')
                    except:
                        print(f'  - [包含特殊字符的单词]')
                    count += 1
    
    # 打印被过滤掉的特殊缩写词
    print('\n被过滤的特殊缩写词（AFMs, AOCs, ASBLs等）：')
    with open(input_file, 'r', encoding='utf-8') as f:
        count = 0
        for line in f:
            word = line.strip()
            if word:
                has_upper_lower_upper = False
                for i in range(len(word) - 2):
                    if word[i].isupper() and word[i+1].islower() and word[i+2].isupper():
                        has_upper_lower_upper = True
                        break
                    if word[0].isupper() and word[-1].isupper():
                        if any(c.islower() for c in word[1:-1]):
                            has_upper_lower_upper = True
                            break
                
                if has_upper_lower_upper:
                    if count < 20:
                        try:
                            print(f'  - {word}')
                        except:
                            print(f'  - [包含特殊字符的单词]')
                        count += 1
