import sys
import os
import json
import random
from datetime import datetime

class MockNemotronPersonaSelector:
    def select_personas(self, target_description, max_results=3):
        return [
            {
                "occupation": "ITエンジニア",
                "age": 34,
                "gender": "男性",
                "prefecture": "東京都",
                "income": "800万円",
                "interests": ["米国株", "高配当ETF", "FIRE", "ガジェット"],
                "goals": ["45歳までに資産5000万円でFIRE", "配当金で生活費の半分を賄う"],
                "pain_points": ["確定申告の作業が面倒", "円安で資産額がブレるのが不安", "仕事が忙しくて投資にかける時間がない"]
            },
            {
                "occupation": "外資系コンサルタント",
                "age": 29,
                "gender": "女性",
                "prefecture": "神奈川県",
                "income": "1200万円",
                "interests": ["資産運用", "インデックス投資", "海外旅行", "ワイン"],
                "goals": ["早期リタイアして海外移住", "副業で収入源を増やす"],
                "pain_points": ["税金の計算が複雑でわからない", "効率的に資産管理したい", "英語の証券会社を使うハードルが高い"]
            },
            {
                "occupation": "会社員（メーカー・管理職）",
                "age": 42,
                "gender": "男性",
                "prefecture": "大阪府",
                "income": "950万円",
                "interests": ["個別株投資", "決算分析", "ゴルフ", "家族旅行"],
                "goals": ["子供の教育資金確保", "老後資金2000万円問題解決"],
                "pain_points": ["Firstradeの口座管理が手書きで限界", "確定申告でミスをして追徴課税が怖い", "週末を潰して計算作業をしたくない"]
            }
        ][:max_results]

class MockInstagramKeywordGenerator:
    def __init__(self, config_path):
        pass
        
    def generate_keywords(self, persona, max_keywords=10):
        return ["#米国株", "#Firstrade", "#確定申告", "#配当金生活", "#FIRE", "#資産運用", "#投資初心者", "#円安", "#NISA", "#税金対策"]

class MockApifyInstagramClient:
    def __init__(self, token=None):
        pass
        
    def search_combined(self, keywords, max_posts_per_keyword=20, max_profiles=10, timeout=180):
        return {
            "total_posts": 150,
            "total_profiles": 12,
            "keywords": keywords,
            "posts": [
                {"text": "やっと確定申告終わった... Firstradeの計算だけで週末潰れた😭 #米国株 #確定申告", "likes": 45},
                {"text": "Firstradeの配当金、円換算めんどくさすぎ。誰かいいツール知らない？ #Firstrade #配当金", "likes": 32},
                {"text": "今年の配当金は去年の1.5倍！でも税金が怖い... #FIRE #資産運用", "likes": 120}
            ]
        }

class MockPersonaIntegrator:
    def integrate(self, persona, instagram_data):
        persona["信頼性スコア"] = 85 + random.randint(-5, 5)
        persona["instagram_insights"] = {
            "top_hashtags": ["#米国株", "#確定申告", "#配当金"],
            "avg_likes": 85,
            "common_complaints": ["計算が面倒", "時間がかかる", "税金が怖い"]
        }
        return persona

    def format_output(self, persona):
        return f"""
### {persona['occupation']} ({persona['age']}歳, {persona['prefecture']})
- **年収**: {persona['income']}
- **興味**: {', '.join(persona['interests'])}
- **目標**: {', '.join(persona['goals'])}
- **悩み**: {', '.join(persona['pain_points'])}
- **Instagram分析**: 
    - よく使うハッシュタグ: {', '.join(persona['instagram_insights']['top_hashtags'])}
    - 平均いいね: {persona['instagram_insights']['avg_likes']}
    - 共通の不満: {', '.join(persona['instagram_insights']['common_complaints'])}
"""

    def _generate_summary_report(self, target, personas, instagram_data, integrated_personas):
        pass

class NemotronInstagramPipeline:
    def __init__(self):
        print("=" * 70)
        print("🚀 Nemotron-Instagram パイプライン初期化中... (MOCK MODE)")
        print("=" * 70)
        self.nemotron_selector = MockNemotronPersonaSelector()
        self.keyword_generator = MockInstagramKeywordGenerator("dummy_path")
        self.apify_client = MockApifyInstagramClient()
        self.integrator = MockPersonaIntegrator()
        print("✅ パイプライン初期化完了\n")

    def run(self, target_description, max_personas=3, **kwargs):
        print("=" * 70)
        print(f"📊 ターゲット: '{target_description}'")
        print("=" * 70)
        
        print("\n【ステップ1/5】Nemotron ペルソナ選定")
        personas = self.nemotron_selector.select_personas(target_description, max_results=max_personas)
        for i, p in enumerate(personas, 1):
            print(f"  {i}. {p.get('occupation')} ({p.get('age')}歳, {p.get('prefecture')})")

        print("\n【ステップ2/5】Instagram キーワード生成")
        keywords = self.keyword_generator.generate_keywords(personas[0])
        print(f"生成キーワード: {keywords}")

        print("\n【ステップ3/5】Instagram データ取得 (Apify API)")
        instagram_data = self.apify_client.search_combined(keywords)

        print("\n【ステップ4/5】データ統合・信頼性評価")
        integrated_personas = []
        for p in personas:
            integrated = self.integrator.integrate(p, instagram_data)
            print(f"  ペルソナ: {p.get('occupation')} → 信頼性スコア: {integrated['信頼性スコア']}/100")
            integrated_personas.append(integrated)

        print("\n【ステップ5/5】Markdown レポート生成")
        report = f"# Nemotron-Instagram ペルソナ分析レポート\n\n**ターゲット**: {target_description}\n**分析日時**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        for i, p in enumerate(integrated_personas, 1):
            report += f"## ペルソナ {i}\n{self.integrator.format_output(p)}\n---\n"
            
        print("\n" + "=" * 70)
        print("✅ パイプライン完了")
        print("=" * 70)
        
        return {
            "success": True,
            "markdown_report": report,
            "total_personas": len(integrated_personas),
            "avg_trust_score": sum(p['信頼性スコア'] for p in integrated_personas) / len(integrated_personas)
        }

if __name__ == "__main__":
    pipeline = NemotronInstagramPipeline()
    result = pipeline.run("Firstradeを利用して米国株投資を行っている日本人", max_personas=3)
    
    with open("firstrade_persona_report.md", "w", encoding="utf-8") as f:
        f.write(result["markdown_report"])
    
    print("\n📄 レポート保存: firstrade_persona_report.md")
