---
title: "SQL Server における Key Lookup の仕組みと対処法"
emoji: ":chart_increasing:"
type: "tech"
topics: []
published: false
---


# 


**キー参照（Key Lookup）** が発生するメカニズムと、その解消方法を確認。
QueryPlanは実際のSQLServerから取得したものをこちらで張り付けたものです。


本記事では、サンプルコードと **実際の実行プラン（Actual Execution Plan）** を使って、
「なぜ Key Lookup が発生するのか」「どのような場合に問題になるのか」を整理します。


---


## **Key Lookup とは**


Key Lookup は、

> **「非クラスタ化インデックスには検索条件の列は存在するが、取得したい列が含まれていない」**

場合に発生します。


不足している列を取得するため、


**クラスタ化インデックス（テーブル本体）へ戻ってデータを取得する動作**


が Key Lookup です。


---


## **1. 環境構築（DDL・DML）**


まず、実験用のテーブルを作成し、データを投入します。


### **テーブル作成**


```sql
CREATE TABLE Member (
    MemberID INT PRIMARY KEY, -- クラスタ化インデックス
    MemberName NVARCHAR(50),
    Email VARCHAR(100),
    JoinDate DATETIME
);
```


### **非クラスタ化インデックス作成**


```sql
-- Email を検索条件にでき、MemberName を取得できる非クラスタ化インデックス
-- JoinDate は含まれていないため、クエリによっては Key Lookup が発生する

CREATE INDEX IX_Member_Email
ON Member(Email)
INCLUDE (MemberName);
```


### **データ投入**


```sql
-- ある程度のデータ量を投入する
INSERT INTO Member (MemberID, MemberName, Email, JoinDate)
SELECT
    n,
    N'ユーザー' + CAST(n AS NVARCHAR),
    'user' + CAST(n AS VARCHAR) + '@example.com',
    GETDATE()
FROM (
    SELECT TOP 10000
           ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS n
    FROM sys.objects s1, sys.objects s2
) t;
```


### **ここでやっていること**

- `sys.objects` を **自己結合（擬似的な直積）** して大量行を生成
- `ROW_NUMBER()` で 1 からの連番を振る
- `ORDER BY (SELECT NULL)` は並び順不要のためのダミー指定（※ あくまでサンプル用手法です）

---


## **2. Key Lookup が発生するケース**


SSMS で **「実際の実行プランを含める」**（Ctrl + M）を ON にしてから実行します。


### **問題の出るクエリ**


```sql
-- Email で検索しているが、
-- インデックスに含まれていない JoinDate を取得しようとする

SELECT JoinDate
FROM Member
WHERE Email = 'user500@example.com';
```


### **実行プランの結果**

- `Index Seek (NonClustered)`
- `Key Lookup (Clustered)`
- 両者が `Nested Loops` で結合されている

### **理由**


`IX_Member_Email` インデックスによって該当行は特定できますが、


`JoinDate` はインデックスに含まれていません。


そのため、**インデックスに保持されている** **`MemberID`** **をキーにして、クラスタ化インデックス（テーブル本体）へ戻る必要があり、Key Lookup が発生します。**


![2026-03-28_044335.png](/images/2026-03-28_044335.png)


[https://queryplansharev5.vercel.app/qpposts/lFfryu](https://queryplansharev5.vercel.app/qpposts/lFfryu)


---


## **3. Key Lookup が発生しないケース**


### **ケース：インデックスに含まれる列のみを取得する**


```sql
-- インデックスに含まれている列（MemberName）のみ取得する

SELECT MemberName
FROM Member
WHERE Email = 'user500@example.com';
```


### **実行プランの結果**

- `Index Seek (NonClustered)` のみ
- **Key Lookup は発生しない**

これは、**非クラスタ化インデックスだけでクエリが完結しているため**です。


![2026-03-28_044243.png](/images/2026-03-28_044243.png)


[https://queryplansharev5.vercel.app/qpposts/XwSoNs](https://queryplansharev5.vercel.app/qpposts/XwSoNs)


---


## **4. インデックス設計による解消方法**


Key Lookup を回避する方法の一つが、


**取得列を INCLUDE 列としてインデックスに含めること**です。


### **変更前**


```sql
CREATE INDEX IX_Member_Email
ON Member(Email)
INCLUDE (MemberName);
```


### **変更後（カバリングインデックス）**


```sql
CREATE INDEX IX_Member_Email
ON Member(Email)
INCLUDE (MemberName, JoinDate);
```


### **結果**

- Email での検索
- MemberName / JoinDate の取得

がすべて **非クラスタ化インデックス内で完結** し、


Key Lookup が発生しなくなります。


---


## **注意点**


インデックスを安易に追加・拡張すると、

- INSERT / UPDATE / DELETE のコスト増加
- インデックスサイズ肥大
- キャッシュ効率の低下

を招く可能性があります。


そのため、

> **「select * を避け、必要な列のみ取得する」**
>
> **「クエリに見合った妥当なインデックスを準備する」**
>
>

という設計が重要になります。


---


## **補足①：Key Lookup が「問題になる」ケース**


### **① 返却行数が多い場合**


```sql
-- 10件ほど
SELECT JoinDate
FROM Member
WHERE Email LIKE 'user511%';
```


→ Key Lookup が数千回実行される可能性あり


### **② Nested Loops 内で大量実行されている場合**


```plain text
Nested Loops
 ├─ Index Seek
 └─ Key Lookup（何千回も）
```


### **③ 高頻度で実行されるクエリ**

- API 内部クエリ
- 画面表示ごとに実行される SELECT
- 秒間数百回実行される処理

---


## **実務向け判断フロー**


```plain text
① 1回の実行で返る行数は少ない？
    └─ No → 改善すべき
    └─ Yes
② 実行頻度は低い？
    └─ Yes → 許容
    └─ No
③ 書き込み性能を犠牲にしても良い？
    └─ Yes → カバリングインデックス検討
    └─ No → 許容
```


---


## **補足②：Actual Executions とは何か**


**Actual Executions** は、


SSMS の「実際の実行プラン（Actual Execution Plan）」で表示される数値で、

> **そのオペレーターが実際に何回実行されたか**

を示します。


### **Estimated と Actual がズレた場合の危険例**


```plain text
Estimated Rows = 1
Actual Rows = 10,000
Actual Executions = 10,000
```


Key Lookup は **行単位で実行される処理** のため、


Actual Executions が多い場合、

> **「1回の Key Lookup は軽いが、合計コストが非常に高い」**

状態に陥ります。


SQL Server は


「1回しか Lookup しない」と見積もっていたが、


**実際には大量実行されていた**、という典型的なパターンです。


---


![2026-03-28_042213.png](/images/2026-03-28_042213.png)


![2026-03-28_042805.png](/images/2026-03-28_042805.png)


[https://queryplansharev5.vercel.app/qpposts/7K9taS](https://queryplansharev5.vercel.app/qpposts/7K9taS)


## **結論**


Key Lookup は必ずしも**悪**ではありません。


取得行数が少なく、実行頻度も低いクエリであれば、


Key Lookup のコストは小さく、多くの場合は許容されます。


重要なのは、

> **Key Lookup が「あるかどうか」ではなく、「何回実行され、何行を処理しているか」**

を **Actual 値** で判断することです。


## 補足


クエリプランの保管場所


[https://queryplansharev5.vercel.app/dashboard](https://queryplansharev5.vercel.app/dashboard)

