#!/usr/bin/env python3
"""
Neural Network for transaction classification and expense prediction.

Features:
- Amount (normalized)
- Hour of day (cyclical: sin/cos encoding)
- Day of week (cyclical: sin/cos encoding)
- Days since start (temporal trend)
- Category embedding (via description text)
- Is weekend (binary)

Target: Expense amount (regression) or Category (classification)

Architecture:
- Text embedding layer (TF-IDF or simple word vectors)
- Numeric features (amount, time, temporal)
- Dense layers with ReLU
- Output: predicted amount or category probabilities
"""

import json
import numpy as np
import re
from datetime import datetime
from typing import List, Dict, Tuple

class TransactionNN:
    def __init__(self, transactions_file: str):
        self.transactions = []
        self.load_transactions(transactions_file)
        self.vocab = {}
        self.category_map = {}
        
    def load_transactions(self, filepath: str):
        """Load transactions from JSON file."""
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        self.transactions = data.get('transactions', data if isinstance(data, list) else [])
        print(f"Loaded {len(self.transactions)} transactions")
    
    def extract_features(self, tx: Dict) -> Dict:
        """Extract numeric and text features from a transaction."""
        features = {}
        
        # 1. Amount (absolute value, normalized)
        amount = abs(float(tx.get('cardAmount') or 0))
        features['amount'] = amount
        features['amount_norm'] = min(amount / 10000, 1.0)  # normalize to [0, 1]
        
        # 2. Time features
        op_date = tx.get('operationDate', '')
        if op_date:
            try:
                dt = datetime.fromisoformat(op_date.replace('Z', '+00:00'))
                features['hour'] = dt.hour
                features['hour_sin'] = np.sin(2 * np.pi * dt.hour / 24)
                features['hour_cos'] = np.cos(2 * np.pi * dt.hour / 24)
                features['day_of_week'] = dt.weekday()
                features['day_sin'] = np.sin(2 * np.pi * dt.weekday() / 7)
                features['day_cos'] = np.cos(2 * np.pi * dt.weekday() / 7)
                features['is_weekend'] = 1 if dt.weekday() >= 5 else 0
            except:
                features.setdefault('hour', 12)
                features.setdefault('hour_sin', 0)
                features.setdefault('hour_cos', 1)
                features.setdefault('day_of_week', 0)
                features.setdefault('day_sin', 0)
                features.setdefault('day_cos', 1)
                features.setdefault('is_weekend', 0)
        
        # 3. Description text (simple word frequency)
        desc = (tx.get('description') or '').lower()
        features['desc_length'] = len(desc)
        features['has_numbers'] = 1 if re.search(r'\d', desc) else 0
        features['keywords'] = self._extract_keywords(desc)
        
        # 4. Operation type (income vs expense)
        features['is_expense'] = 1 if amount < 0 or 'расход' in desc else 0
        
        return features
    
    def _extract_keywords(self, text: str) -> Dict[str, float]:
        """Extract keyword presence from description."""
        keywords = {
            'yandex': 'yandex' in text or 'uber' in text,
            'grocery': 'pyaterochka' in text or 'magnit' in text or 'produkty' in text,
            'pharmacy': 'apteka' in text,
            'transport': 'metro' in text or 'transkart' in text,
            'service': 'servis' in text,
            'restaurant': 'stolovaya' in text or 'kafe' in text,
        }
        return {k: 1.0 if v else 0.0 for k, v in keywords.items()}
    
    def build_dataset(self) -> Tuple[np.ndarray, np.ndarray]:
        """
        Build feature matrix and target vector.
        
        Feature vector (15 dimensions):
        [amount_norm, hour_sin, hour_cos, day_sin, day_cos, is_weekend, 
         desc_length_norm, has_numbers, yandex, grocery, pharmacy, transport, 
         service, restaurant, is_expense]
        
        Target: amount (for regression)
        """
        X = []
        y = []
        
        for tx in self.transactions:
            features = self.extract_features(tx)
            
            # Build feature vector
            amount = features.get('amount', 0)
            amount_norm = features.get('amount_norm', 0)
            hour_sin = features.get('hour_sin', 0)
            hour_cos = features.get('hour_cos', 1)
            day_sin = features.get('day_sin', 0)
            day_cos = features.get('day_cos', 1)
            is_weekend = features.get('is_weekend', 0)
            
            desc_len = min(features.get('desc_length', 0) / 100, 1.0)
            has_num = features.get('has_numbers', 0)
            
            keywords = features.get('keywords', {})
            yandex = keywords.get('yandex', 0)
            grocery = keywords.get('grocery', 0)
            pharmacy = keywords.get('pharmacy', 0)
            transport = keywords.get('transport', 0)
            service = keywords.get('service', 0)
            restaurant = keywords.get('restaurant', 0)
            
            is_expense = features.get('is_expense', 0)
            
            # Combine into feature vector
            feature_vec = np.array([
                amount_norm, hour_sin, hour_cos, day_sin, day_cos,
                is_weekend, desc_len, has_num, yandex, grocery,
                pharmacy, transport, service, restaurant, is_expense
            ], dtype=np.float32)
            
            X.append(feature_vec)
            y.append(amount)  # Target: predict amount
        
        return np.array(X), np.array(y)
    
    def simple_nn_forward(self, X: np.ndarray, W1: np.ndarray, b1: np.ndarray,
                          W2: np.ndarray, b2: np.ndarray) -> np.ndarray:
        """
        Simple 2-layer NN forward pass (for demo/prototyping).
        
        Layer 1: 15 inputs → 32 hidden (ReLU)
        Layer 2: 32 hidden → 1 output (linear for regression)
        """
        # Hidden layer with ReLU
        z1 = np.dot(X, W1) + b1  # (N, 32)
        a1 = np.maximum(0, z1)   # ReLU
        
        # Output layer (linear)
        z2 = np.dot(a1, W2) + b2  # (N, 1)
        return z2.flatten()
    
    def print_summary(self):
        """Print dataset summary."""
        if not self.transactions:
            print("No transactions loaded")
            return
        
        amounts = [abs(tx.get('cardAmount', 0)) for tx in self.transactions]
        print(f"\n=== Dataset Summary ===")
        print(f"Total transactions: {len(self.transactions)}")
        print(f"Amount stats (RUB):")
        print(f"  Min: {min(amounts):.2f}")
        print(f"  Max: {max(amounts):.2f}")
        print(f"  Mean: {np.mean(amounts):.2f}")
        print(f"  Median: {np.median(amounts):.2f}")
        print(f"  Std: {np.std(amounts):.2f}")
        
        # Category distribution
        cats = {}
        for tx in self.transactions:
            desc = (tx.get('description') or '').upper()
            cat = 'Other'
            if 'YANDEX' in desc or 'UBER' in desc:
                cat = 'Taxi'
            elif 'PYATEROCHKA' in desc or 'MAGNIT' in desc:
                cat = 'Grocery'
            elif 'APTEKA' in desc:
                cat = 'Pharmacy'
            cats[cat] = cats.get(cat, 0) + 1
        
        print(f"\nTop categories:")
        for cat, count in sorted(cats.items(), key=lambda x: x[1], reverse=True)[:5]:
            print(f"  {cat}: {count}")


def main():
    import sys
    if len(sys.argv) < 2:
        print("Usage: python ml_model.py <statements.json>")
        sys.exit(1)
    
    filepath = sys.argv[1]
    model = TransactionNN(filepath)
    model.print_summary()
    
    print(f"\n=== Building Feature Matrix ===")
    X, y = model.build_dataset()
    print(f"Feature matrix shape: {X.shape}")
    print(f"Target vector shape: {y.shape}")
    print(f"\nFeature dimensions: 15")
    print(f"  [amount_norm, hour_sin, hour_cos, day_sin, day_cos,")
    print(f"   is_weekend, desc_len, has_numbers, yandex, grocery,")
    print(f"   pharmacy, transport, service, restaurant, is_expense]")
    
    print(f"\n=== Proposed NN Architecture ===")
    print(f"Input layer: 15 features")
    print(f"Hidden layer 1: 32 neurons (ReLU)")
    print(f"Hidden layer 2: 16 neurons (ReLU, optional)")
    print(f"Output layer: 1 neuron (linear, for amount prediction)")
    print(f"\nLoss: Mean Squared Error (MSE)")
    print(f"Optimizer: Adam (learning_rate=0.001)")
    print(f"Metrics: MAE, R²")
    print(f"\nThis can be implemented in TensorFlow/PyTorch")
    print(f"For now, features are ready for training!")


if __name__ == '__main__':
    main()
