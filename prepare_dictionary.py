import re
import csv
import json

# ---------- 1. 过滤逻辑（复用自 filter_dictionary.py） ----------
def is_valid_french_word(word):
    """检查单词是否只包含法文拉丁字母（包括重音符号）且不是缩写词"""
    if not word:
        return False
    pattern = r'^[a-zA-ZàâäèéêëîïôöùûüÿæœçÀÂÄÈÉÊËÎÏÔÖÙÛÜŸÆŒÇ]+$'
    if not re.match(pattern, word):
        return False
    if word.isupper():
        return False
    if len(word) > 2:
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
        if has_upper_sequence and not word.isupper():
            return False
    return True

def filter_dictionary(input_csv, output_csv):
    valid_words = []
    invalid_count = 0
    with open(input_csv, 'r', encoding='utf-8') as f:
        for line in f:
            word = line.strip()
            if is_valid_french_word(word):
                valid_words.append(word)
            else:
                invalid_count += 1
    with open(output_csv, 'w', encoding='utf-8') as f:
        for word in valid_words:
            f.write(word + '\n')
    print(f'原始词汇数: {len(valid_words) + invalid_count}')
    print(f'合规词汇数: {len(valid_words)}')
    print(f'不合规词汇数: {invalid_count}')
    return valid_words

# ---------- 2. CSV 转 JSON（小写） ----------
def csv_to_json(csv_path, json_path):
    words = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        for line in f:
            word = line.strip().lower()
            if word:
                words.append(word)
    # 去重并排序
    words = sorted(set(words))
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(words, f, ensure_ascii=False, indent=2)
    print(f'JSON 已生成，共 {len(words)} 个单词，保存至 {json_path}')

# ---------- 3. 一键执行 ----------
if __name__ == '__main__':
    # 第一步：过滤原始词典（若已有 dictionary_filtered.csv 可跳过，但为了安全仍执行）
    print("=== 开始过滤词典 ===")
    filter_dictionary('dictionary.csv', 'dictionary_filtered.csv')
    
    # 第二步：转换为 JSON
    print("\n=== 开始转换为 JSON ===")
    csv_to_json('dictionary_filtered.csv', 'dictionary.json')
    
    print("\n[OK] 全部完成！请将 dictionary.json 放在与 index.html 相同的目录下。")
