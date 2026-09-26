import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  aiCredits: number;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  currency: string;
  duration: number; // e.g. 30, 6, 12
  durationUnit: 'Days' | 'Months' | 'Years';
  description: string;
  features: string[];
  accessLevel: 'Starter' | 'Professional' | 'Premium';
  aiCredits: number;
  isFeatured: boolean;
  status: 'active' | 'inactive';
  displayOrder: number;
  couponEligibility: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  accessLevel: 'Starter' | 'Professional' | 'Premium';
  paymentId: string;
  amount: number;
  currency: string;
  startDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'revoked';
  paymentGateway: string;
  isManualGrant?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  couponCode?: string;
  discountAmount?: number;
  status: 'succeeded' | 'failed' | 'pending';
  paymentGateway: 'Razorpay' | 'Stripe' | 'Manual';
  gatewayPaymentId?: string;
  gatewayOrderId?: string;
  createdAt: string;
}

export interface CodeSection {
  title: string;
  filename: string;
  language: string;
  description: string;
  code: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  categoryId: string;
  categoryName: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  technologyStack: string[];
  problemStatement: string;
  businessUseCase: string;
  datasetInformation: {
    name: string;
    source: string;
    rows: string;
    columns: string;
    description: string;
    downloadUrlOrInstructions: string;
  };
  architecture: {
    overview: string;
    pipelineSteps: string[];
    diagramSummary: string;
  };
  codeSections: CodeSection[];
  explanation: string;
  output: string;
  howToRun: string[];
  howToDeploy: string[];
  faq: { question: string; answer: string }[];
  aiPromptContext: string;
  thumbnail: string;
  demoUrl?: string;
  accessLevel: 'Free' | 'Starter' | 'Professional' | 'Premium';
  status: 'Published' | 'Draft' | 'Archived';
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  projectCount?: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'Percentage' | 'Fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  maxUses: number;
  usedCount: number;
  perUserLimit: number;
  applicablePlanIds: string[]; // empty for all
  minAmount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface AIUsageLog {
  id: string;
  userId: string;
  userEmail: string;
  projectId: string;
  projectTitle: string;
  question: string;
  tokensEstimated: number;
  timestamp: string;
}

export interface Banner {
  id: string;
  title: string;
  description: string;
  badge?: string;
  ctaText: string;
  ctaUrl: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
  bgTheme?: string;
  createdAt: string;
}

export interface HomepageCMS {
  hero: {
    brandTagline: string;
    title: string;
    subtitle: string;
    primaryCtaText: string;
    primaryCtaUrl: string;
    secondaryCtaText: string;
    secondaryCtaUrl: string;
    statsBadge: string;
  };
  whatIsVsw: {
    heading: string;
    subheading: string;
    points: { title: string; desc: string; icon: string }[];
  };
  howItWorks: {
    step1: { title: string; desc: string };
    step2: { title: string; desc: string };
    step3: { title: string; desc: string };
    step4: { title: string; desc: string };
  };
  testimonials: {
    name: string;
    role: string;
    company: string;
    avatar: string;
    quote: string;
  }[];
  faq: {
    question: string;
    answer: string;
  }[];
  footer: {
    companyName: string;
    tagline: string;
    contactEmail: string;
    copyrightYear: string;
    disclaimer: string;
  };
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'payment' | 'subscription' | 'project' | 'announcement';
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  details: string;
  targetId?: string;
  targetType?: string;
  timestamp: string;
}

export interface PaymentGatewayConfig {
  activeGateway: 'Razorpay' | 'Stripe' | 'Simulation';
  testMode: boolean;
  razorpay: {
    keyId: string;
    keySecret: string;
    webhookSecret: string;
    enabled: boolean;
  };
  stripe: {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
    enabled: boolean;
  };
  currency: string;
}

export interface SiteSettings {
  siteName: string;
  brandName: string;
  tagline: string;
  supportEmail: string;
  allowSignups: boolean;
  freeTierAIQuestionsLimit: number;
}

export interface DatabaseSchema {
  users: User[];
  plans: Plan[];
  subscriptions: Subscription[];
  payments: Payment[];
  projects: Project[];
  categories: Category[];
  coupons: Coupon[];
  aiUsage: AIUsageLog[];
  banners: Banner[];
  homepage: HomepageCMS;
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  gatewayConfig: PaymentGatewayConfig;
  settings: SiteSettings;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Simple crypto hash for passwords
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_vsw_ml_hub_salt').digest('hex');
}

export function calculateExpiry(duration: number, unit: 'Days' | 'Months' | 'Years', fromDate = new Date()): string {
  const date = new Date(fromDate);
  if (unit === 'Days') {
    date.setDate(date.getDate() + duration);
  } else if (unit === 'Months') {
    date.setMonth(date.getMonth() + duration);
  } else if (unit === 'Years') {
    date.setFullYear(date.getFullYear() + duration);
  }
  return date.toISOString();
}

export function getAccessHierarchyLevel(level: 'Free' | 'Starter' | 'Professional' | 'Premium'): number {
  switch (level) {
    case 'Free': return 0;
    case 'Starter': return 1;
    case 'Professional': return 2;
    case 'Premium': return 3;
    default: return 0;
  }
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (e) {
        console.error('Failed reading DB file, re-seeding:', e);
        this.data = this.getSeedData();
        this.save();
      }
    } else {
      this.data = this.getSeedData();
      this.save();
    }
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  public save() {
    this.ensureDirectory();
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  public get(): DatabaseSchema {
    return this.data;
  }

  private getSeedData(): DatabaseSchema {
    const adminUser: User = {
      id: 'usr_admin_1',
      name: 'VSW Admin',
      email: 'admin@vswdata.com',
      passwordHash: hashPassword('admin123'),
      role: 'admin',
      status: 'active',
      aiCredits: 9999,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const proUser: User = {
      id: 'usr_pro_demo',
      name: 'Rohan Sharma',
      email: 'pro@example.com',
      passwordHash: hashPassword('user123'),
      role: 'user',
      status: 'active',
      aiCredits: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const freeUser: User = {
      id: 'usr_free_demo',
      name: 'Ananya Verma',
      email: 'free@example.com',
      passwordHash: hashPassword('user123'),
      role: 'user',
      status: 'active',
      aiCredits: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const starterPlan: Plan = {
      id: 'plan_starter',
      name: 'Starter',
      slug: 'starter',
      price: 799,
      originalPrice: 1299,
      discountPercentage: 38,
      currency: 'INR',
      duration: 30,
      durationUnit: 'Days',
      description: 'Ideal for students, beginners and engineers starting practical ML engineering.',
      features: [
        'Access to 15+ Starter & Free ML Projects',
        'Full Source Code & Architecture Walkthroughs',
        'Dataset Guides & Preprocessing Notebooks',
        'Line-by-Line Code Viewer with Copy Tool',
        'Interactive AI Assistant (25 Queries/mo)',
        'Standard Community Discord Support'
      ],
      accessLevel: 'Starter',
      aiCredits: 25,
      isFeatured: false,
      status: 'active',
      displayOrder: 1,
      couponEligibility: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const professionalPlan: Plan = {
      id: 'plan_professional',
      name: 'Professional',
      slug: 'professional',
      price: 1699,
      originalPrice: 2999,
      discountPercentage: 43,
      currency: 'INR',
      duration: 6,
      durationUnit: 'Months',
      description: 'The most popular choice for software developers, data scientists and job seekers.',
      features: [
        'Access to 40+ Starter & Professional ML Projects',
        'Production Deployment Guides (FastAPI, Docker, Streamlit)',
        'Full Source Code with Modular Pipelines',
        'Interactive AI Assistant (100 Queries/mo)',
        'Business Impact & Architecture Blueprints',
        'Continuous Bi-Weekly New Project Drops',
        'Priority Tech Support'
      ],
      accessLevel: 'Professional',
      aiCredits: 100,
      isFeatured: true,
      status: 'active',
      displayOrder: 2,
      couponEligibility: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const premiumPlan: Plan = {
      id: 'plan_premium',
      name: 'Premium',
      slug: 'premium',
      price: 2499,
      originalPrice: 4999,
      discountPercentage: 50,
      currency: 'INR',
      duration: 12,
      durationUnit: 'Months',
      description: 'Complete unconstrained access for professionals, AI consultants & ML researchers.',
      features: [
        'Unrestricted Access to ALL Projects (including Enterprise)',
        'Advanced Generative AI, LLMs & Computer Vision Systems',
        'Kubernetes, Ray & Cloud CI/CD Deployment Blueprints',
        'High-Performance AI Assistant (Unlimited Queries)',
        'Commercial Copy & Build Rights for Client Solutions',
        'Direct 1-on-1 Q&A Support with Senior ML Engineers'
      ],
      accessLevel: 'Premium',
      aiCredits: 500,
      isFeatured: false,
      status: 'active',
      displayOrder: 3,
      couponEligibility: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const initialSubscription: Subscription = {
      id: 'sub_demo_1',
      userId: proUser.id,
      planId: professionalPlan.id,
      planName: professionalPlan.name,
      accessLevel: 'Professional',
      paymentId: 'pay_demo_pro_init',
      amount: 1699,
      currency: 'INR',
      startDate: new Date().toISOString(),
      expiryDate: calculateExpiry(6, 'Months'),
      status: 'active',
      paymentGateway: 'Razorpay',
      notes: 'Initial Demo User Subscription',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const initialPayment: Payment = {
      id: 'pay_demo_pro_init',
      orderId: 'order_init_1001',
      userId: proUser.id,
      userEmail: proUser.email,
      planId: professionalPlan.id,
      planName: professionalPlan.name,
      amount: 1699,
      currency: 'INR',
      status: 'succeeded',
      paymentGateway: 'Razorpay',
      gatewayPaymentId: 'pay_razorpay_sim_99812',
      gatewayOrderId: 'order_razorpay_sim_1001',
      createdAt: new Date().toISOString(),
    };

    const categories: Category[] = [
      { id: 'cat_ml', name: 'Machine Learning', slug: 'machine-learning', description: 'Classical and modern predictive modeling and statistical learning', iconName: 'Brain' },
      { id: 'cat_dl', name: 'Deep Learning', slug: 'deep-learning', description: 'Multi-layer neural architectures for complex feature representation', iconName: 'Layers' },
      { id: 'cat_nlp', name: 'NLP', slug: 'nlp', description: 'Natural Language Processing, transformers, tokenization and text analysis', iconName: 'MessageSquareText' },
      { id: 'cat_cv', name: 'Computer Vision', slug: 'computer-vision', description: 'Image recognition, semantic segmentation, object detection and tracking', iconName: 'Eye' },
      { id: 'cat_reg', name: 'Regression', slug: 'regression', description: 'Continuous numeric value prediction, time series forecasting and price models', iconName: 'TrendingUp' },
      { id: 'cat_cls', name: 'Classification', slug: 'classification', description: 'Binary and multiclass decision systems, fraud risk and churn models', iconName: 'CheckCircle2' },
      { id: 'cat_clu', name: 'Clustering', slug: 'clustering', description: 'Unsupervised segmentation, market cohorts and pattern clustering', iconName: 'Users' },
      { id: 'cat_fc', name: 'Forecasting', slug: 'forecasting', description: 'Time-series decomposition, ARIMA, Prophet and deep temporal modeling', iconName: 'LineChart' },
      { id: 'cat_rec', name: 'Recommendation Systems', slug: 'recommendation-systems', description: 'Collaborative filtering, matrix factorization and vector search retrieval', iconName: 'Sparkles' },
      { id: 'cat_anom', name: 'Anomaly Detection', slug: 'anomaly-detection', description: 'Outlier detection, cybersecurity threat modeling and system monitoring', iconName: 'ShieldAlert' },
      { id: 'cat_genai', name: 'Generative AI', slug: 'generative-ai', description: 'LLMs, RAG, prompt engineering, agentic workflows and fine-tuning', iconName: 'Bot' },
      { id: 'cat_other', name: 'Other', slug: 'other', description: 'Data pipelines, MLOps, inference optimization and utility scripts', iconName: 'Cpu' },
    ];

    const projects: Project[] = [
      {
        id: 'proj_sentiment_roberta',
        title: 'Real-Time Sentiment Analysis with RoBERTa & FastAPI',
        slug: 'sentiment-analysis-roberta-fastapi',
        shortDescription: 'Production-ready NLP service transforming raw customer feedback into granular emotional sentiment metrics using fine-tuned RoBERTa.',
        fullDescription: 'This end-to-end NLP project builds a high-throughput sentiment classification service. It covers dataset tokenization with Hugging Face transformers, fine-tuning RoBERTa on multi-domain reviews, quantization for sub-15ms CPU inference, and wrapping the artifact inside a Dockerized FastAPI service with Prometheus health checks.',
        categoryId: 'cat_nlp',
        categoryName: 'NLP',
        difficulty: 'Beginner',
        technologyStack: ['Python 3.11', 'PyTorch', 'Transformers', 'FastAPI', 'Uvicorn', 'Docker'],
        problemStatement: 'Modern consumer businesses receive thousands of support tickets, app reviews, and social mentions hourly. Manual classification is slow and inconsistent, delaying escalations on critical customer churn events.',
        businessUseCase: 'Automated ticket routing, CSAT real-time dashboarding, competitor brand sentiment tracking, and PR crisis early-warning alerts.',
        datasetInformation: {
          name: 'Amazon Customer Reviews Sentiment Dataset (Subset 50k)',
          source: 'HuggingFace Datasets / Amazon Product Reviews',
          rows: '50,000 processed samples',
          columns: 'review_text, rating, sentiment_label (0: Negative, 1: Neutral, 2: Positive)',
          description: 'Curated balanced text samples cleaned of HTML tags and normalized for emotional classification.',
          downloadUrlOrInstructions: 'Automated download via `datasets.load_dataset("amazon_polarity", split="train[:50000]")` in `data_loader.py`.'
        },
        architecture: {
          overview: 'Microservice architecture separating batch tokenization from inference with asynchronous endpoints.',
          pipelineSteps: [
            'Text ingestion and regex normalization',
            'RoBERTa Byte-Pair Encoding tokenization (max_len=128)',
            'Forward pass through Transformer classification head',
            'Softmax confidence calibration and payload response'
          ],
          diagramSummary: 'Client Request -> FastAPI Endpoint -> Async Tokenizer -> TorchScript Model -> Confidence Scorer -> JSON Payload'
        },
        codeSections: [
          {
            title: 'Model Definition & Preprocessing',
            filename: 'model.py',
            language: 'python',
            description: 'Loads pretrained RoBERTa weights with custom dropout and classification head.',
            code: `import torch
import torch.nn as nn
from transformers import AutoModel, AutoTokenizer

MODEL_NAME = "roberta-base"

class SentimentClassifier(nn.Module):
    def __init__(self, n_classes: int = 3, dropout_rate: float = 0.3):
        super(SentimentClassifier, self).__init__()
        self.roberta = AutoModel.from_pretrained(MODEL_NAME)
        self.drop = nn.Dropout(p=dropout_rate)
        self.out = nn.Linear(self.roberta.config.hidden_size, n_classes)
        
    def forward(self, input_ids, attention_mask):
        outputs = self.roberta(
            input_ids=input_ids,
            attention_mask=attention_mask
        )
        pooled_output = outputs[1]
        output = self.drop(pooled_output)
        return self.out(output)

def get_tokenizer():
    return AutoTokenizer.from_pretrained(MODEL_NAME)`
          },
          {
            title: 'FastAPI Serving Engine',
            filename: 'api.py',
            language: 'python',
            description: 'High-speed asynchronous REST API endpoint with Pydantic validation.',
            code: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import torch
from model import SentimentClassifier, get_tokenizer

app = FastAPI(title="VSW ML HUB - Sentiment Engine", version="1.0.0")

tokenizer = get_tokenizer()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = SentimentClassifier(n_classes=3)
# In production, load fine-tuned weights:
# model.load_state_dict(torch.load("weights/roberta_sentiment.pt", map_location=device))
model.to(device)
model.eval()

LABELS = {0: "NEGATIVE", 1: "NEUTRAL", 2: "POSITIVE"}

class ReviewRequest(BaseModel):
    text: str = Field(..., min_length=2, max_length=1000, example="This product exceeded all my expectations!")

class PredictionResponse(BaseModel):
    sentiment: str
    confidence: float
    probabilities: dict[str, float]

@app.post("/predict", response_model=PredictionResponse)
async def predict_sentiment(payload: ReviewRequest):
    try:
        inputs = tokenizer.encode_plus(
            payload.text,
            None,
            add_special_tokens=True,
            max_length=128,
            padding="max_length",
            truncation=True,
            return_token_type_ids=False,
            return_attention_mask=True,
            return_tensors="pt"
        )
        
        input_ids = inputs["input_ids"].to(device)
        attention_mask = inputs["attention_mask"].to(device)
        
        with torch.no_grad():
            outputs = model(input_ids, attention_mask)
            probs = torch.softmax(outputs, dim=1).squeeze().tolist()
            predicted_idx = int(torch.argmax(outputs, dim=1).item())
            
        return PredictionResponse(
            sentiment=LABELS[predicted_idx],
            confidence=round(probs[predicted_idx], 4),
            probabilities={LABELS[i]: round(probs[i], 4) for i in range(3)}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))`
          }
        ],
        explanation: 'The RoBERTa model optimizes BERT pretraining by removing next-sentence prediction and utilizing dynamic masking over longer sequences. In this project, we attach a linear projection atop the pooled representation vector, fine-tuning with cross-entropy loss over 3 epochs with AdamW (lr=2e-5) and linear warm-up.',
        output: 'Accuracy: 94.2% on holdout validation. Sub-18ms inference latency on CPU, 3ms on GPU. F1-score: 0.938.',
        howToRun: [
          'git clone repo && cd sentiment-roberta',
          'python -m venv venv && source venv/bin/activate',
          'pip install -r requirements.txt',
          'uvicorn api:app --host 0.0.0.0 --port 8000 --reload'
        ],
        howToDeploy: [
          'Build Docker image: docker build -t vsw-sentiment:v1 .',
          'Run container: docker run -p 8000:8000 vsw-sentiment:v1',
          'Deploy to AWS App Runner or Google Cloud Run with 2 vCPUs and 2GB RAM.'
        ],
        faq: [
          { question: 'Why RoBERTa over standard BERT?', answer: 'RoBERTa trains on 10x more data with dynamic masking, delivering noticeably superior sentiment nuance on colloquial text.' },
          { question: 'Can this run in batch mode?', answer: 'Yes, modify api.py to accept List[str] with tokenizer(..., padding=True) for vector parallel batching.' }
        ],
        aiPromptContext: 'This project is a PyTorch and FastAPI sentiment analysis engine using RoBERTa-base. 3 classes: NEGATIVE, NEUTRAL, POSITIVE.',
        thumbnail: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=600&auto=format&fit=crop&q=80',
        accessLevel: 'Free',
        status: 'Published',
        viewsCount: 3410,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'proj_churn_prediction',
        title: 'Customer Churn Prediction & Retention Optimization',
        slug: 'customer-churn-prediction',
        shortDescription: 'Enterprise churn risk modeling with XGBoost, LightGBM, SHAP feature attribution, and automated retention ROI simulations.',
        fullDescription: 'A complete customer lifetime value and churn risk scoring system. Incorporates feature engineering from transactional & demographic logs, cross-validated XGBoost/LightGBM tuning, probability calibration using Isotonic Regression, and an interactive Streamlit simulation console for marketing intervention testing.',
        categoryId: 'cat_cls',
        categoryName: 'Classification',
        difficulty: 'Intermediate',
        technologyStack: ['Python', 'XGBoost', 'LightGBM', 'Scikit-Learn', 'SHAP', 'Streamlit', 'Pandas'],
        problemStatement: 'SaaS and telecom companies lose between 15% and 25% of their customer base yearly. Acquiring replacement customers costs 5x to 7x more than retaining an existing account.',
        businessUseCase: 'Early intervention workflows for high-value accounts, dynamic coupon targeting, NPS outreach triggers, and retention marketing optimization.',
        datasetInformation: {
          name: 'Telco Churn Benchmark & Behavioral Log Data',
          source: 'IBM Telco & Synthetic Enterprise Cohorts',
          rows: '70,430 rows',
          columns: 'tenure, monthly_charges, total_charges, contract_type, support_tickets, payment_method, churn',
          description: 'Comprehensive historical account lifecycle metrics enriched with behavioral support signals.',
          downloadUrlOrInstructions: 'Download telco_churn_clean.csv directly or execute `python scripts/download_dataset.py`.'
        },
        architecture: {
          overview: 'Feature pipeline with categorical target encoding, gradient boosted trees, and SHAP explainability.',
          pipelineSteps: [
            'Missing value imputation & tenure binning',
            'Categorical one-hot and frequency encoding',
            'SMOTE / Class-weight balancing on imbalanced target',
            'Optuna Bayesian hyperparameter search over 100 trials',
            'SHAP value tree-explainer extraction for local decision transparency'
          ],
          diagramSummary: 'Raw CSV/SQL -> Data Cleaning -> Feature Store -> Optuna Tuner -> XGBoost Core -> SHAP Explainer -> Retention Dashboard'
        },
        codeSections: [
          {
            title: 'Feature Engineering & Training Pipeline',
            filename: 'train_churn_model.py',
            language: 'python',
            description: 'End-to-end pipeline with Scikit-Learn transformers and XGBoost classifier.',
            code: `import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, roc_auc_score
from xgboost import XGBClassifier
import joblib

def build_pipeline():
    numeric_features = ['tenure', 'MonthlyCharges', 'TotalCharges', 'SupportTickets']
    categorical_features = ['Contract', 'PaymentMethod', 'InternetService', 'TechSupport']

    numeric_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(handle_unknown='ignore')

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ]
    )

    clf = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', XGBClassifier(
            n_estimators=300,
            learning_rate=0.03,
            max_depth=5,
            subsample=0.8,
            colsample_bytree=0.8,
            scale_pos_weight=3.2,
            random_state=42
        ))
    ])
    return clf

if __name__ == "__main__":
    df = pd.read_csv("data/telco_churn.csv")
    df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce').fillna(0)
    df['SupportTickets'] = np.random.poisson(1.2, len(df))
    
    X = df.drop(columns=['Churn', 'customerID'])
    y = (df['Churn'] == 'Yes').astype(int)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
    
    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)
    
    y_pred_proba = pipeline.predict_proba(X_test)[:, 1]
    print(f"ROC-AUC Score: {roc_auc_score(y_test, y_pred_proba):.4f}")
    joblib.dump(pipeline, "models/churn_xgb_pipeline.pkl")`
          },
          {
            title: 'SHAP Explainability & Risk Attribution',
            filename: 'explainability.py',
            language: 'python',
            description: 'Computes SHAP feature importance values to show exactly why a specific user is flagged.',
            code: `import shap
import joblib
import pandas as pd

def generate_shap_report(customer_row: pd.DataFrame):
    pipeline = joblib.load("models/churn_xgb_pipeline.pkl")
    preprocessor = pipeline.named_steps['preprocessor']
    model = pipeline.named_steps['classifier']
    
    transformed_data = preprocessor.transform(customer_row)
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(transformed_data)
    
    feature_names = preprocessor.get_feature_names_out()
    top_risk_factors = sorted(
        zip(feature_names, shap_values[0]),
        key=lambda x: abs(x[1]),
        reverse=True
    )[:5]
    
    return {
        "churn_probability": float(pipeline.predict_proba(customer_row)[0][1]),
        "key_drivers": [{"factor": f.replace("cat__", "").replace("num__", ""), "impact": round(float(v), 3)} for f, v in top_risk_factors]
    }`
          }
        ],
        explanation: 'Handling class imbalance is vital in churn modeling. Using scale_pos_weight alongside Bayesian optimization ensures high recall (identifying actual churners) without triggering excessive false alarms that waste marketing budget.',
        output: 'ROC-AUC: 0.864, Recall: 81.2%, Precision: 64.5%. Identifies ~80% of churners 45 days before contract expiration.',
        howToRun: [
          'pip install -r requirements.txt',
          'python train_churn_model.py',
          'streamlit run app/retention_simulator.py'
        ],
        howToDeploy: [
          'Serialize pipeline artifact to AWS S3 bucket.',
          'Trigger daily batch scoring job via Apache Airflow DAG or AWS Lambda.',
          'Write high-risk churn scores back to Salesforce or HubSpot CRM via webhooks.'
        ],
        faq: [
          { question: 'What does scale_pos_weight do?', answer: 'It penalizes false negatives proportionally to class frequency, heavily prioritizing identifying rare churners.' }
        ],
        aiPromptContext: 'XGBoost churn prediction model with Scikit-learn pipeline, SHAP attribution, ROC-AUC 0.864.',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
        accessLevel: 'Professional',
        status: 'Published',
        viewsCount: 4890,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'proj_house_price',
        title: 'Real Estate Valuation & House Price Prediction',
        slug: 'house-price-prediction',
        shortDescription: 'Multi-variable regularized regression and ensemble stacking predicting residential valuations with geospatial feature engineering.',
        fullDescription: 'Predicts housing sales values based on structural features, neighborhood economic indices, and geospatial distance to city amenities. Demonstrates Ridge, Lasso, Random Forest, and LightGBM ensemble stacking.',
        categoryId: 'cat_reg',
        categoryName: 'Regression',
        difficulty: 'Beginner',
        technologyStack: ['Python', 'Scikit-Learn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn'],
        problemStatement: 'Real estate pricing suffers from extreme non-linearities, spatial clustering, and seasonal market dynamics.',
        businessUseCase: 'Automated valuation models (AVM) for mortgage underwriting, prop-tech listings, and investment portfolio risk estimation.',
        datasetInformation: {
          name: 'Ames Housing & King County Sales Dataset',
          source: 'OpenML / Kaggle Real Estate Benchmarks',
          rows: '21,613 records',
          columns: 'bedrooms, bathrooms, sqft_living, sqft_lot, floors, waterfront, view, grade, lat, long, price',
          description: 'Verified residential transactions including structural quality grades and GPS coordinates.',
          downloadUrlOrInstructions: 'Automated download from `data/fetch_housing.py`.'
        },
        architecture: {
          overview: 'Log-transformed target regression with k-fold StackingRegressor.',
          pipelineSteps: [
            'Log1p normalization of skewed target and square-foot features',
            'Geographic distance calculation to city center using Haversine formula',
            'Base models: Ridge, Lasso, and Gradient Boosting Regressor',
            'Meta-learner: Ridge regression blending out-of-fold predictions'
          ],
          diagramSummary: 'Raw CSV -> Spatial Distance Extraction -> Log-Scaling -> Base Learners -> Meta Regressor -> Calibrated Price'
        },
        codeSections: [
          {
            title: 'Stacking Ensemble Model',
            filename: 'train_stacking.py',
            language: 'python',
            description: 'Multi-model ensemble combining linear and tree algorithms.',
            code: `import numpy as np
import pandas as pd
from sklearn.ensemble import StackingRegressor, RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import RidgeCV, LassoCV
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

def train_housing_model(df: pd.DataFrame):
    df['sqft_total'] = df['sqft_living'] + df['sqft_lot'] * 0.1
    df['is_renovated'] = (df['yr_renovated'] > 0).astype(int)
    
    features = ['bedrooms', 'bathrooms', 'sqft_living', 'grade', 'sqft_total', 'is_renovated']
    X = df[features]
    y = np.log1p(df['price'])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    estimators = [
        ('rf', RandomForestRegressor(n_estimators=100, random_state=42)),
        ('gb', GradientBoostingRegressor(n_estimators=150, max_depth=4, learning_rate=0.05)),
        ('lasso', LassoCV(cv=5))
    ]
    
    stack = StackingRegressor(
        estimators=estimators,
        final_estimator=RidgeCV()
    )
    
    stack.fit(X_train, y_train)
    y_pred = stack.predict(X_test)
    
    rmse = np.sqrt(mean_squared_error(np.expm1(y_test), np.expm1(y_pred)))
    r2 = r2_score(y_test, y_pred)
    print("Test RMSE: " + str(round(rmse, 2)) + " | R2 Score: " + str(round(r2, 4)))
    return stack`
          }
        ],
        explanation: 'Ensemble stacking leverages the linear extrapolation benefits of Ridge regression while preserving the non-linear thresholding of tree ensembles. Log-transforming the price target stabilizes variance across luxury properties.',
        output: 'R² Score: 0.892, Mean Absolute Percentage Error (MAPE): 8.4%.',
        howToRun: [
          'pip install numpy pandas scikit-learn',
          'python train_stacking.py'
        ],
        howToDeploy: [
          'Export ONNX runtime artifact for high-speed sub-millisecond scoring.',
          'Package in lightweight AWS Lambda function with API Gateway.'
        ],
        faq: [
          { question: 'Why log-transform the target?', answer: 'Real estate prices exhibit heavy right skew; log1p normalizes residuals to satisfy Gaussian assumptions.' }
        ],
        aiPromptContext: 'Stacking ensemble regression for real estate valuation with log1p target transformation and MAPE 8.4%.',
        thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop&q=80',
        accessLevel: 'Starter',
        status: 'Published',
        viewsCount: 2980,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'proj_fraud_detection',
        title: 'Real-Time Financial Fraud Detection & Isolation',
        slug: 'advanced-fraud-detection',
        shortDescription: 'High-speed credit card fraud detection engine handling 99.8% class imbalance with Autoencoders, Isolation Forests & LightGBM.',
        fullDescription: 'Production-grade anti-fraud framework capable of scoring incoming financial transactions under 8 milliseconds. Implements unsupervised deep autoencoders for novel anomaly detection paired with calibrated LightGBM supervised trees for known fraud patterns.',
        categoryId: 'cat_anom',
        categoryName: 'Anomaly Detection',
        difficulty: 'Advanced',
        technologyStack: ['Python', 'PyTorch', 'LightGBM', 'Kafka', 'Redis', 'Docker'],
        problemStatement: 'Global payment fraud accounts for over $32 billion in merchant losses annually. Latency constraints mandate sub-10ms decisioning on every swipe.',
        businessUseCase: 'Credit card swipe authorization, crypto exchange wallet risk scoring, wire transfer AML alerts.',
        datasetInformation: {
          name: 'European Cardholders Anomaly Benchmark',
          source: 'ULB Machine Learning Group / Kaggle',
          rows: '284,807 card transactions',
          columns: 'Time, V1-V28 (PCA transformed), Amount, Class (0: Genuine, 1: Fraud)',
          description: 'Highly imbalanced benchmark with only 492 fraud cases (0.172%).',
          downloadUrlOrInstructions: 'Available via pre-bundled script `python data/get_fraud_data.py`.'
        },
        architecture: {
          overview: 'Two-tier ensemble: Deep Reconstruction Autoencoder + Supervised Gradient Booster.',
          pipelineSteps: [
            'Robust scaling of non-PCA transaction Amount and Time intervals',
            'Unsupervised Autoencoder training exclusively on genuine transactions',
            'Reconstruction error MSE calculation as novel anomaly feature',
            'LightGBM tree trained with focal loss on balanced subsets'
          ],
          diagramSummary: 'Transaction Event -> Redis Feature Hydration -> PyTorch Autoencoder (Recon Error) -> LightGBM Classifier -> Block / Review Decision'
        },
        codeSections: [
          {
            title: 'PyTorch Deep Anomaly Autoencoder',
            filename: 'autoencoder.py',
            language: 'python',
            description: 'Learns latent representation of normal transactions; high loss flags anomalous fraud.',
            code: `import torch
import torch.nn as nn

class FraudAutoencoder(nn.Module):
    def __init__(self, input_dim: int = 30):
        super(FraudAutoencoder, self).__init__()
        # Encoder
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 20),
            nn.BatchNorm1d(20),
            nn.LeakyReLU(),
            nn.Linear(20, 10),
            nn.LeakyReLU(),
            nn.Linear(10, 4)  # Latent bottleneck
        )
        # Decoder
        self.decoder = nn.Sequential(
            nn.Linear(4, 10),
            nn.LeakyReLU(),
            nn.Linear(10, 20),
            nn.BatchNorm1d(20),
            nn.LeakyReLU(),
            nn.Linear(20, input_dim)
        )

    def forward(self, x):
        latent = self.encoder(x)
        reconstruction = self.decoder(latent)
        return reconstruction

def compute_anomaly_score(model: nn.Module, x: torch.Tensor) -> torch.Tensor:
    model.eval()
    with torch.no_grad():
        recon = model(x)
        loss = torch.mean((x - recon) ** 2, dim=1)
    return loss`
          },
          {
            title: 'Real-Time Streaming Transaction Evaluator',
            filename: 'evaluator.py',
            language: 'python',
            description: 'Hybrid scorer combining reconstruction anomaly scores with gradient booster.',
            code: `import torch
import numpy as np
import joblib
from autoencoder import FraudAutoencoder, compute_anomaly_score

class RealTimeFraudEngine:
    def __init__(self, ae_path: str, lgb_path: str):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.autoencoder = FraudAutoencoder(input_dim=30)
        self.autoencoder.load_state_dict(torch.load(ae_path, map_location=self.device))
        self.autoencoder.to(self.device)
        self.autoencoder.eval()
        
        self.lgb_model = joblib.load(lgb_path)
        self.anomaly_threshold = 0.045

    def score_transaction(self, features: list[float]) -> dict:
        tensor_x = torch.tensor([features], dtype=torch.float32).to(self.device)
        recon_score = float(compute_anomaly_score(self.autoencoder, tensor_x).item())
        
        combined_features = np.array([features + [recon_score]])
        prob_fraud = float(self.lgb_model.predict_proba(combined_features)[0][1])
        
        action = "APPROVE"
        if prob_fraud > 0.85 or recon_score > 0.15:
            action = "DECLINE"
        elif prob_fraud > 0.50 or recon_score > self.anomaly_threshold:
            action = "CHALLENGE_2FA"
            
        return {
            "fraud_probability": round(prob_fraud, 4),
            "anomaly_score": round(recon_score, 4),
            "decision": action
        }`
          }
        ],
        explanation: 'Because fraud evolves dynamically, supervised models alone fail on zero-day attack vectors. Pairing deep autoencoders with LightGBM catches both known attack signatures and novel anomalous spending bursts.',
        output: 'Average Precision (PR-AUC): 0.891, Detection Rate: 92.4% with False Positive Rate under 0.05%.',
        howToRun: [
          'pip install torch lightgbm joblib',
          'python train_hybrid.py',
          'python simulate_transactions.py'
        ],
        howToDeploy: [
          'Compile PyTorch Autoencoder to C++ TorchScript or TensorRT.',
          'Deploy as a sidecar container in Kubernetes alongside your core payment gateway.',
          'Connect to Redis cluster for stateful user velocity metrics.'
        ],
        faq: [
          { question: 'Why use an Autoencoder instead of standard Isolation Forest?', answer: 'Autoencoders scale better to large batch throughput and integrate seamlessly into GPU pipelines.' }
        ],
        aiPromptContext: 'Hybrid anomaly detection and fraud classification engine using PyTorch Autoencoders and LightGBM.',
        thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&auto=format&fit=crop&q=80',
        accessLevel: 'Premium',
        status: 'Published',
        viewsCount: 5120,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'proj_ecommerce_recommender',
        title: 'Two-Tower E-Commerce Recommendation Engine',
        slug: 'ecommerce-recommendation-engine',
        shortDescription: 'Dual-encoder neural retrieval with FAISS vector similarity search and ranker for personalized product discovery.',
        fullDescription: 'Production two-tower recommendation framework modeled after modern YouTube & Pinterest architectures. Features user query tower, item candidate tower, Approximate Nearest Neighbor (ANN) indexation using FAISS, and a cross-attention reranker.',
        categoryId: 'cat_rec',
        categoryName: 'Recommendation Systems',
        difficulty: 'Advanced',
        technologyStack: ['Python', 'PyTorch', 'FAISS', 'FastAPI', 'Redis', 'Docker'],
        problemStatement: 'Generic product listings result in high bounce rates. Catalogs with over 500,000 items require personalized candidate generation in under 20ms.',
        businessUseCase: 'Personalized homepage carousels, "Frequently Bought Together" bundles, and cart abandon email triggers.',
        datasetInformation: {
          name: 'Instacart & MovieLens 1M User Interaction Graph',
          source: 'Instacart Open Dataset',
          rows: '3.2 million interaction logs',
          columns: 'user_id, item_id, rating, timestamp, category, brand_id',
          description: 'User clickstream, reorders, and explicit rating logs.',
          downloadUrlOrInstructions: 'Automated download via `python data/load_instacart.py`.'
        },
        architecture: {
          overview: 'Candidate generation via Two-Tower dot-product + FAISS IndexIVFFlat + LightGBM Ranker.',
          pipelineSteps: [
            'Embedding layer for user history and product metadata',
            'Dual neural towers projecting user and item into 64-dim shared vector space',
            'Sub-linear ANN retrieval of top 200 candidates via FAISS',
            'Cross-feature reranker prioritizing margin, stock availability and conversion likelihood'
          ],
          diagramSummary: 'User ID -> User Tower -> 64D Vector -> FAISS Vector DB -> Top 200 Candidates -> Reranker -> Top 10 Product Recommendations'
        },
        codeSections: [
          {
            title: 'Two-Tower PyTorch Architecture',
            filename: 'two_tower.py',
            language: 'python',
            description: 'Dual neural encoder generating normalized user and item embeddings.',
            code: `import torch
import torch.nn as nn
import torch.nn.functional as F

class UserTower(nn.Module):
    def __init__(self, num_users: int, embedding_dim: int = 64):
        super(UserTower, self).__init__()
        self.user_embed = nn.Embedding(num_users, embedding_dim)
        self.fc = nn.Sequential(
            nn.Linear(embedding_dim, 128),
            nn.ReLU(),
            nn.Linear(128, embedding_dim)
        )
        
    def forward(self, user_id):
        x = self.user_embed(user_id)
        x = self.fc(x)
        return F.normalize(x, p=2, dim=-1)

class ItemTower(nn.Module):
    def __init__(self, num_items: int, embedding_dim: int = 64):
        super(ItemTower, self).__init__()
        self.item_embed = nn.Embedding(num_items, embedding_dim)
        self.fc = nn.Sequential(
            nn.Linear(embedding_dim, 128),
            nn.ReLU(),
            nn.Linear(128, embedding_dim)
        )
        
    def forward(self, item_id):
        x = self.item_embed(item_id)
        x = self.fc(x)
        return F.normalize(x, p=2, dim=-1)`
          }
        ],
        explanation: 'Decoupling user representation from item representation allows pre-indexing millions of product vectors into FAISS. When a user requests a page, only the user tower runs in real-time, fetching nearest neighbors in ~2ms.',
        output: 'Hit Rate@10: 78.4%, Mean Reciprocal Rank (MRR): 0.612, Sub-12ms total pipeline latency.',
        howToRun: [
          'pip install torch faiss-cpu fastapi uvicorn',
          'python index_items.py',
          'uvicorn server:app --port 8080'
        ],
        howToDeploy: [
          'Host FAISS index on memory-optimized AWS EC2 (r6i.large).',
          'Deploy FastAPI gateway with Kubernetes HPA.'
        ],
        faq: [
          { question: 'How is cold start handled?', answer: 'New products fall back to category popularity and brand embeddings until interaction volume builds.' }
        ],
        aiPromptContext: 'Two-tower dual encoder recommendation system with FAISS ANN retrieval and hit rate@10 of 78.4%.',
        thumbnail: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&auto=format&fit=crop&q=80',
        accessLevel: 'Professional',
        status: 'Published',
        viewsCount: 3820,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'proj_defect_detection_cv',
        title: 'Industrial Quality Defect Detection with YOLOv8',
        slug: 'defect-detection-computer-vision',
        shortDescription: 'Edge-optimized automated visual inspection identifying microscopic surface defects in manufacturing lines with YOLOv8.',
        fullDescription: 'Comprehensive computer vision pipeline for automated defect detection on factory conveyor belts. Includes camera stream frame grabbing, data augmentation for rare scratches and cracks, YOLOv8 fine-tuning, TensorRT conversion for NVIDIA Jetson edge devices, and bounding box alert telemetry.',
        categoryId: 'cat_cv',
        categoryName: 'Computer Vision',
        difficulty: 'Advanced',
        technologyStack: ['Python', 'Ultralytics YOLOv8', 'OpenCV', 'TensorRT', 'FastAPI'],
        problemStatement: 'Manual visual inspection on production lines leads to 12% escape rates due to human fatigue, causing expensive downstream product recalls.',
        businessUseCase: 'Semiconductor wafer inspection, sheet metal crack identification, PCB solder bridge detection.',
        datasetInformation: {
          name: 'NEU Surface Defect & PCB Benchmark',
          source: 'Northeastern University Surface Defect Database',
          rows: '1,800 annotated 200x200 grayscale images',
          columns: '6 defect categories: rolled-in scale, patches, crazing, pitted surface, inclusion, scratches',
          description: 'High-resolution industrial imaging dataset with bounding box XML/YOLO annotations.',
          downloadUrlOrInstructions: 'Download bundled sample set with `python download_neu.py`.'
        },
        architecture: {
          overview: 'Camera capture -> Frame buffer -> YOLOv8 Edge Inference -> Defect Bounding Box -> PLC Trigger.',
          pipelineSteps: [
            'RTSP camera stream buffering with OpenCV VideoCapture',
            'Letterbox image resizing and normalization',
            'YOLOv8s object detection forward pass',
            'Non-Maximum Suppression (NMS) and confidence filtering (>0.75)',
            'MQTT alert dispatch to factory programmable logic controller (PLC)'
          ],
          diagramSummary: 'Industrial Camera -> RTSP Ingestion -> YOLOv8 TensorRT Engine -> Defect Coordinates -> MQTT Alert -> Ejector Arm'
        },
        codeSections: [
          {
            title: 'Real-Time Inference & Bounding Box Visualizer',
            filename: 'infer_stream.py',
            language: 'python',
            description: 'Runs YOLOv8 model against live video feed with bounding box overlay.',
            code: `import cv2
from ultralytics import YOLO

def run_inspection(stream_source: str = 0, model_path: str = "best_neu_yolo.pt"):
    model = YOLO(model_path)
    cap = cv2.VideoCapture(stream_source)
    
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break
            
        # Run detection with confidence threshold 0.65
        results = model(frame, conf=0.65, verbose=False)
        annotated_frame = results[0].plot()
        
        # Check if critical defect was found
        defect_count = len(results[0].boxes)
        if defect_count > 0:
            cv2.putText(
                annotated_frame,
                f"ALERT: {defect_count} DEFECTS DETECTED",
                (20, 50),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 0, 255),
                3
            )
            
        cv2.imshow("VSW ML HUB - Automated Inspection", annotated_frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
            
    cap.release()
    cv2.destroyAllWindows()`
          }
        ],
        explanation: 'YOLOv8 uses an anchor-free split head with mosaic augmentation during training, dramatically increasing detection mAP on tiny surface fissures that traditional CNNs overlook.',
        output: 'mAP@0.5: 0.947, 58 FPS on NVIDIA Jetson Orin Nano edge hardware.',
        howToRun: [
          'pip install ultralytics opencv-python',
          'python train_yolo.py --epochs 50',
          'python infer_stream.py'
        ],
        howToDeploy: [
          'Export model: `yolo export model=best.pt format=engine device=0`',
          'Mount on NVIDIA Jetson edge device using DeepStream SDK.'
        ],
        faq: [
          { question: 'Can this run without GPU?', answer: 'Yes, with OpenVINO or ONNX CPU quantization at ~15-20 FPS.' }
        ],
        aiPromptContext: 'Industrial computer vision surface defect detection using YOLOv8 with mAP 0.947 and edge deployment.',
        thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80',
        accessLevel: 'Premium',
        status: 'Published',
        viewsCount: 4190,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'proj_rag_document_qa',
        title: 'Enterprise RAG Document QA Engine with Vector Search',
        slug: 'rag-document-qa-bot',
        shortDescription: 'Production-ready Retrieval-Augmented Generation system parsing PDFs, chunking semantic graphs, and generating hallucination-free answers.',
        fullDescription: 'Enterprise knowledge base assistant implementing advanced RAG patterns: semantic chunking, reciprocal rank fusion (RRF) between dense vector search and BM25 sparse keyword search, reranking, and citation attribution with verifiable source page numbers.',
        categoryId: 'cat_genai',
        categoryName: 'Generative AI',
        difficulty: 'Advanced',
        technologyStack: ['Python', 'LangChain', 'ChromaDB', 'Gemini / OpenAI API', 'FastAPI', 'Streamlit'],
        problemStatement: 'Corporate compliance, policy manuals and technical blueprints are buried in hundreds of unstructured PDFs. Standard LLMs hallucinate internal guidelines.',
        businessUseCase: 'Internal HR policy bots, legal contract analysis, financial SEC 10-K filing auditing, and customer service escalation.',
        datasetInformation: {
          name: 'Sample SEC 10-K Filings & Enterprise PDF Corpus',
          source: 'Public SEC EDGAR Filings',
          rows: '150 PDF documents (~2,400 pages)',
          columns: 'Extracted text sections, tables, page metadata, parent header hierachy',
          description: 'Formatted financial disclosure documents used to benchmark question answering fidelity.',
          downloadUrlOrInstructions: 'Sample PDFs included in `/data/sample_docs/` folder.'
        },
        architecture: {
          overview: 'Hybrid Sparse+Dense vector retrieval with cross-encoder reranking and strict citation injection.',
          pipelineSteps: [
            'PyPDF / Unstructured document parsing and recursive character splitting',
            'Dense vector embeddings via text-embedding models',
            'Sparse keyword indexing via BM25',
            'Reciprocal Rank Fusion (RRF) merging top 20 chunks',
            'Context synthesis prompt with strict source citation constraints'
          ],
          diagramSummary: 'User Question -> Hybrid Search (BM25 + ChromaDB) -> Cross-Encoder Reranker -> Top 3 Chunks -> LLM Generator -> Grounded Answer with Citations'
        },
        codeSections: [
          {
            title: 'Hybrid Retrieval & Grounded Generation',
            filename: 'rag_pipeline.py',
            language: 'python',
            description: 'Core retrieval engine executing hybrid vector search and structured synthesis.',
            code: `from typing import List
import chromadb
from sentence_transformers import SentenceTransformer

class RAGEngine:
    def __init__(self, collection_name: str = "vsw_knowledge_base"):
        self.client = chromadb.Client()
        self.collection = self.client.get_or_create_collection(collection_name)
        self.embedder = SentenceTransformer("all-MiniLM-L6-v2")
        
    def add_documents(self, documents: List[str], metadatas: List[dict]):
        embeddings = self.embedder.encode(documents).tolist()
        ids = [f"doc_{i}" for i in range(len(documents))]
        self.collection.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )
        
    def query(self, user_query: str, top_k: int = 3) -> dict:
        query_embedding = self.embedder.encode([user_query]).tolist()
        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=top_k
        )
        
        context_chunks = results["documents"][0]
        sources = results["metadatas"][0]
        
        context_str = "\\n\\n---\\n\\n".join(
            [f"[Source: {s.get('filename')}, Page {s.get('page')}]:\\n{c}" for c, s in zip(context_chunks, sources)]
        )
        
        system_prompt = (
            "You are an enterprise knowledge assistant. Answer ONLY using the facts from the provided context. "
            "If the answer is not contained within the context, explicitly reply 'I do not have sufficient information in the provided documentation.' "
            "Always cite the source document and page number."
        )
        
        return {
            "system_prompt": system_prompt,
            "retrieved_context": context_str,
            "sources": sources
        }`
          }
        ],
        explanation: 'Hybrid retrieval prevents the classic failure modes of vector embeddings on exact part numbers or acronyms by maintaining BM25 token fidelity alongside semantic embedding proximity.',
        output: 'RAGAS faithfulness score: 0.96, Answer relevancy: 0.94, Sub-600ms total retrieval latency.',
        howToRun: [
          'pip install chromadb sentence-transformers langchain',
          'python ingest_docs.py',
          'streamlit run app/chat_ui.py'
        ],
        howToDeploy: [
          'Store vector embeddings in managed Pinecone or pgvector instance.',
          'Deploy generation worker on AWS ECS with private VPC endpoints.'
        ],
        faq: [
          { question: 'How do you prevent hallucinations?', answer: 'Prompt engineering enforces strict refusal rules if the retrieved text lacks the answer, accompanied by cross-encoder thresholding.' }
        ],
        aiPromptContext: 'Hybrid RAG pipeline with ChromaDB, BM25, and strict citation generation for enterprise documents.',
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        accessLevel: 'Premium',
        status: 'Published',
        viewsCount: 6200,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'proj_stock_forecasting',
        title: 'Time Series Financial Forecasting with Temporal Fusion Transformers',
        slug: 'stock-price-forecasting',
        shortDescription: 'Multi-horizon macroeconomic and equity forecasting utilizing PyTorch Forecasting and Temporal Fusion Transformers (TFT).',
        fullDescription: 'Advanced probabilistic time-series forecasting. Integrates multi-horizon prediction intervals (10th, 50th, 90th percentiles), interpretable self-attention weights showing temporal feature importance, macroeconomic covariate conditioning, and risk-adjusted backtesting.',
        categoryId: 'cat_fc',
        categoryName: 'Forecasting',
        difficulty: 'Intermediate',
        technologyStack: ['Python', 'PyTorch Forecasting', 'Pandas', 'Plotly', 'Streamlit'],
        problemStatement: 'Classical ARIMA and exponential smoothing fail to capture complex exogenous market factors such as interest rate shifts and volatility spikes.',
        businessUseCase: 'Commodity inventory hedging, quantitative equity factor modeling, portfolio risk value-at-risk (VaR) quantification.',
        datasetInformation: {
          name: 'S&P 500 Daily OHLCV & Macro Covariates',
          source: 'Yahoo Finance & FRED Economic Data (Federal Reserve)',
          rows: '15 years of daily observations (~3,780 trading days)',
          columns: 'open, high, low, close, volume, treasury_10yr, vix_index, cpi_mom',
          description: 'Historical equity bars combined with interest rates and inflation figures.',
          downloadUrlOrInstructions: 'Automated ingestion via `python fetch_macro_data.py`.'
        },
        architecture: {
          overview: 'Gated Residual Networks (GRN) with Variable Selection Networks (VSN) and Multi-Head Temporal Self-Attention.',
          pipelineSteps: [
            'Time-series stationarity verification and rolling z-score scaling',
            'Time index encoding and cyclical seasonal features',
            'Temporal Fusion Transformer training over 60-day context window predicting 14 days forward',
            'Quantile loss optimization (P10, P50, P90) producing confidence bands'
          ],
          diagramSummary: 'Historical Equity + Macro Bars -> Variable Selection Network -> LSTM Encoder -> Multi-Head Self-Attention -> Quantile Decoder (P10, P50, P90)'
        },
        codeSections: [
          {
            title: 'TFT Model Initialization & Quantile Loss',
            filename: 'tft_model.py',
            language: 'python',
            description: 'Builds PyTorch Forecasting TimeSeriesDataSet and TemporalFusionTransformer.',
            code: `from pytorch_forecasting import TemporalFusionTransformer, TimeSeriesDataSet
from pytorch_forecasting.metrics import QuantileLoss
import lightning.pytorch as pl

def train_tft_model(training_data):
    max_prediction_length = 14
    max_encoder_length = 60
    
    training = TimeSeriesDataSet(
        training_data,
        time_idx="time_idx",
        target="close_normalized",
        group_ids=["ticker"],
        min_encoder_length=max_encoder_length // 2,
        max_encoder_length=max_encoder_length,
        min_prediction_length=1,
        max_prediction_length=max_prediction_length,
        static_categoricals=["ticker"],
        time_varying_known_reals=["time_idx", "day_of_week", "month"],
        time_varying_unknown_reals=["close_normalized", "volume_normalized", "vix", "treasury_10yr"],
    )
    
    train_dataloader = training.to_dataloader(batch_size=64, shuffle=True)
    
    tft = TemporalFusionTransformer.from_dataset(
        training,
        learning_rate=0.03,
        hidden_size=32,
        attention_head_size=4,
        dropout=0.15,
        loss=QuantileLoss([0.1, 0.5, 0.9]),
        reduce_on_plateau_patience=4
    )
    
    trainer = pl.Trainer(max_epochs=30, accelerator="auto")
    trainer.fit(tft, train_dataloaders=train_dataloader)
    return tft`
          }
        ],
        explanation: 'Unlike black-box LSTMs, the TFT architecture provides inherent interpretability through its Variable Selection Networks, displaying exactly which economic metrics drove the forecast.',
        output: 'Mean Absolute Scaled Error (MASE): 0.78, Quantile Loss P90 Coverage: 91.2%.',
        howToRun: [
          'pip install pytorch-forecasting lightning',
          'python train_tft.py',
          'streamlit run app/forecast_viz.py'
        ],
        howToDeploy: [
          'Save model checkpoint to ONNX / TorchScript.',
          'Schedule automated nightly retraining pipeline on AWS SageMaker.'
        ],
        faq: [
          { question: 'Why quantile loss instead of MSE?', answer: 'Financial decisions require risk envelopes; quantiles provide lower/upper bounds for risk budgeting.' }
        ],
        aiPromptContext: 'Temporal Fusion Transformer (TFT) forecasting stock prices and macro covariates with multi-horizon quantile intervals.',
        thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80',
        accessLevel: 'Professional',
        status: 'Published',
        viewsCount: 3100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'proj_customer_ltv',
        title: 'Customer Lifetime Value (LTV) Prediction with BG/NBD',
        slug: 'customer-ltv-prediction',
        shortDescription: 'Probabilistic statistical modeling using BG/NBD & Gamma-Gamma to estimate future purchases and monetary value.',
        fullDescription: 'Predicts individual customer retention probability and monetary spending over the next 12 months. Uses Beta-Geometric/Negative Binomial Distribution (BG/NBD) paired with Gamma-Gamma spend modeling from RFM (Recency, Frequency, Monetary) transaction histories.',
        categoryId: 'cat_reg',
        categoryName: 'Regression',
        difficulty: 'Beginner',
        technologyStack: ['Python', 'Lifetimes', 'Pandas', 'Plotly', 'FastAPI'],
        problemStatement: 'E-commerce retailers spend equally on marketing acquisition without knowing which cohorts generate 80% of repeat profits.',
        businessUseCase: 'High-LTV customer VIP rewards, CAC ceiling calculation, ad platform lookalike audience seed generation.',
        datasetInformation: {
          name: 'Online Retail II E-Commerce Transactions',
          source: 'UCI Machine Learning Repository',
          rows: '541,909 invoice lines',
          columns: 'InvoiceNo, StockCode, Description, Quantity, InvoiceDate, UnitPrice, CustomerID, Country',
          description: 'Two years of real transactional logs from a UK-based non-store online retailer.',
          downloadUrlOrInstructions: 'Run `python download_online_retail.py` to fetch clean dataset.'
        },
        architecture: {
          overview: 'RFM transformation -> BG/NBD model (frequency & churn probability) -> Gamma-Gamma (average spend) -> Projected 1-year LTV.',
          pipelineSteps: [
            'Aggregation of raw orders into Recency, Frequency, Monetary and Age (T)',
            'Fitting BG/NBD to capture the repeat purchase and dropout rate',
            'Fitting Gamma-Gamma sub-model on repeat customer monetary values',
            'Discounted cash flow NPV computation for future 12 months'
          ],
          diagramSummary: 'Transactions -> RFM Summary Matrix -> BG/NBD Model + Gamma-Gamma Model -> Expected Purchases + Monetary Value -> Customer LTV Tier'
        },
        codeSections: [
          {
            title: 'Probabilistic LTV Calculation',
            filename: 'ltv_model.py',
            language: 'python',
            description: 'Computes customer alive probability and future expected spend.',
            code: `import pandas as pd
from lifetimes import BetaGeoFitter, GammaGammaFitter
from lifetimes.utils import summary_data_from_transaction_data

def compute_customer_ltv(transactions_df: pd.DataFrame):
    summary = summary_data_from_transaction_data(
        transactions_df,
        customer_id_col='CustomerID',
        datetime_col='InvoiceDate',
        monetary_value_col='TotalPrice',
        observation_period_end='2024-12-31'
    )
    # Filter customers with at least 1 repeat purchase
    repeat_customers = summary[summary['frequency'] > 0]
    
    bgf = BetaGeoFitter(penalizer_coef=0.01)
    bgf.fit(summary['frequency'], summary['recency'], summary['T'])
    
    ggf = GammaGammaFitter(penalizer_coef=0.01)
    ggf.fit(repeat_customers['frequency'], repeat_customers['monetary_value'])
    
    summary['prob_alive'] = bgf.conditional_probability_alive(
        summary['frequency'], summary['recency'], summary['T']
    )
    
    summary['expected_purchases_90d'] = bgf.conditional_expected_number_of_purchases_up_to_time(
        90, summary['frequency'], summary['recency'], summary['T']
    )
    
    summary['predicted_clv_1yr'] = ggf.customer_lifetime_value(
        bgf,
        summary['frequency'],
        summary['recency'],
        summary['T'],
        summary['monetary_value'],
        time=12,
        discount_rate=0.01
    )
    return summary`
          }
        ],
        explanation: 'The BG/NBD model elegantly separates the coin toss of whether a customer is still "alive" from the Poisson process of how often they buy when alive, making it far superior to linear regression.',
        output: 'Cohort purchase prediction correlation: 0.88, Spearman rank on top 10% high-value customers: 0.84.',
        howToRun: [
          'pip install lifetimes pandas plotly',
          'python ltv_model.py'
        ],
        howToDeploy: [
          'Run as a weekly batch transformation job on Snowflake or Databricks.',
          'Export high-LTV segment customer IDs to Meta Ads and Google Ads Custom Audiences.'
        ],
        faq: [
          { question: 'Why use BG/NBD over Deep Learning?', answer: 'BG/NBD requires no huge GPU clusters, works on small customer cohorts, and produces strictly calibrated purchase probabilities.' }
        ],
        aiPromptContext: 'Probabilistic customer lifetime value model using BG/NBD and Gamma-Gamma from RFM transaction data.',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
        accessLevel: 'Free',
        status: 'Published',
        viewsCount: 2750,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    const coupons: Coupon[] = [
      {
        id: 'coup_welcome20',
        code: 'WELCOME20',
        discountType: 'Percentage',
        discountValue: 20,
        startDate: new Date('2025-01-01').toISOString(),
        endDate: new Date('2030-12-31').toISOString(),
        maxUses: 1000,
        usedCount: 14,
        perUserLimit: 1,
        applicablePlanIds: [],
        minAmount: 500,
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'coup_vsw500',
        code: 'VSW500',
        discountType: 'Fixed',
        discountValue: 500,
        startDate: new Date('2025-01-01').toISOString(),
        endDate: new Date('2030-12-31').toISOString(),
        maxUses: 500,
        usedCount: 9,
        perUserLimit: 1,
        applicablePlanIds: ['plan_professional', 'plan_premium'],
        minAmount: 1500,
        status: 'active',
        createdAt: new Date().toISOString(),
      }
    ];

    const banners: Banner[] = [
      {
        id: 'ban_festive_offer',
        title: 'Special Launch Offer: Get 20% Off Any Subscription with code WELCOME20',
        description: 'Unlock 40+ production machine learning projects with full source code, datasets and AI assistant.',
        badge: 'LIMITED TIME',
        ctaText: 'View Plans',
        ctaUrl: '#pricing',
        startDate: new Date('2025-01-01').toISOString(),
        endDate: new Date('2030-12-31').toISOString(),
        status: 'active',
        bgTheme: 'from-blue-900 to-indigo-950',
        createdAt: new Date().toISOString(),
      }
    ];

    const homepage: HomepageCMS = {
      hero: {
        brandTagline: 'VSW DATA SOLUTIONS • AI • SOFTWARE • AUTOMATION',
        title: 'Learn. Copy. Build. Deploy.',
        subtitle: 'Access practical machine learning projects, production source code, architecture breakdowns, datasets and AI assistance — all in one modern engineering platform.',
        primaryCtaText: 'Explore ML Projects',
        primaryCtaUrl: '/projects',
        secondaryCtaText: 'View Access Plans',
        secondaryCtaUrl: '/pricing',
        statsBadge: '40+ Production ML Projects • 100% Verified Code • Docker Ready'
      },
      whatIsVsw: {
        heading: 'What is VSW ML HUB?',
        subheading: 'A curated engineering repository built for data scientists, ML engineers, and developers who learn by building real-world systems.',
        points: [
          {
            title: 'Real Production Code, Not Academic Toy Models',
            desc: 'Every project includes modular Python pipelines, requirements, Docker configurations and FastAPI inference servers.',
            icon: 'Code2'
          },
          {
            title: 'Instant In-Browser Code Access & Copy Tool',
            desc: 'Browse, inspect line-by-line syntax, and copy clean individual blocks or full modules without downloading massive clutter.',
            icon: 'Copy'
          },
          {
            title: 'Architectural Blueprints & Problem Statements',
            desc: 'Understand the business ROI, data pipelines, trade-offs, and deployment mechanics before writing a single line.',
            icon: 'Workflow'
          },
          {
            title: 'Context-Aware AI Assistant on Every Project',
            desc: 'Ask technical questions, debug errors, request API conversions or optimize hyperparameters with AI trained on project documentation.',
            icon: 'Sparkles'
          }
        ]
      },
      howItWorks: {
        step1: { title: '1. Create Account & Select Plan', desc: 'Choose a Starter, Professional or Premium plan with transparent durations and immediate access.' },
        step2: { title: '2. Browse Projects & Datasets', desc: 'Filter by NLP, Computer Vision, Deep Learning, Forecasting, Anomaly Detection or Classification.' },
        step3: { title: '3. Read Architecture & Copy Code', desc: 'Inspect clean syntax-highlighted code, copy production modules and understand deployment.' },
        step4: { title: '4. Ask AI & Deploy to Cloud', desc: 'Interact with the project AI assistant to adapt code for your own company or client infrastructure.' }
      },
      testimonials: [
        {
          name: 'Vikram Sengupta',
          role: 'Lead ML Engineer',
          company: 'FinTech Analytics Labs',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
          quote: 'VSW ML HUB saved our team at least 3 months of prototyping time. We adapted the Fraud Detection and Customer Churn architectures directly into our production pipeline.'
        },
        {
          name: 'Pooja Sundaram',
          role: 'Senior Data Scientist',
          company: 'HealthScale Global',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
          quote: 'The code quality is stellar. It is not notebook spaghetti; every project has clean modular Python files, Dockerfiles, and explanation walkthroughs.'
        },
        {
          name: 'Aditya Nair',
          role: 'Full Stack AI Developer',
          company: 'Nexus Automations',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
          quote: 'The project AI Assistant is a game-changer. I asked how to convert the RoBERTa sentiment service to an AWS Lambda serverless handler and got working code in 5 seconds.'
        }
      ],
      faq: [
        {
          question: 'Do I download the entire project library as a zip?',
          answer: 'No. VSW ML HUB is a modern web-based access library. You browse, study documentation, inspect line numbers, and copy verified code snippets and configurations directly in your browser.'
        },
        {
          question: 'Are there free projects I can test first?',
          answer: 'Yes! We offer fully open Free tier projects (such as Sentiment Analysis with RoBERTa and Customer LTV Modeling) so you can review code quality and documentation depth before subscribing.'
        },
        {
          question: 'Can I use this code in commercial client projects?',
          answer: 'Yes! Subscribed users (Professional and Premium) have full rights to copy, adapt, build and deploy these solutions for client work and proprietary company applications.'
        },
        {
          question: 'How does the project AI assistant work?',
          answer: 'Each project features an interactive "Ask AI" assistant that is dynamically grounded in the specific project’s code, dataset information, architecture, and technology stack.'
        },
        {
          question: 'What payment methods do you support?',
          answer: 'We support UPI, Net Banking, Credit/Debit Cards, and International Payments via our payment abstraction layer (including Razorpay and Stripe).'
        }
      ],
      footer: {
        companyName: 'VSW DATA SOLUTIONS',
        tagline: 'AI • SOFTWARE • AUTOMATION',
        contactEmail: 'contact@vswdata.com',
        copyrightYear: '2026',
        disclaimer: 'VSW ML HUB is an educational and engineering accelerator product by VSW DATA SOLUTIONS. All trademarks and datasets belong to their respective owners.'
      }
    };

    const notifications: NotificationItem[] = [
      {
        id: 'notif_welcome',
        userId: proUser.id,
        title: 'Welcome to Professional Access',
        message: 'Your 6-month Professional plan is active. Explore 40+ projects with code viewer and AI support.',
        type: 'subscription',
        read: false,
        createdAt: new Date().toISOString()
      }
    ];

    const auditLogs: AuditLog[] = [
      {
        id: 'audit_init',
        adminId: adminUser.id,
        adminEmail: adminUser.email,
        action: 'SYSTEM_INITIALIZATION',
        details: 'Initial system seed with default dynamic plans, categories, and published ML projects.',
        timestamp: new Date().toISOString()
      }
    ];

    const gatewayConfig: PaymentGatewayConfig = {
      activeGateway: 'Razorpay',
      testMode: true,
      razorpay: {
        keyId: 'rzp_test_vswmlhub2026',
        keySecret: 'vsw_secret_rzp_mock_live_secure',
        webhookSecret: 'whsec_vswmlhub_webhook',
        enabled: true
      },
      stripe: {
        publishableKey: 'pk_test_vswmlhub_stripe',
        secretKey: 'sk_test_vswmlhub_stripe_secret',
        webhookSecret: 'whsec_stripe_mock',
        enabled: true
      },
      currency: 'INR'
    };

    const settings: SiteSettings = {
      siteName: 'VSW ML HUB',
      brandName: 'VSW DATA SOLUTIONS',
      tagline: 'Learn. Copy. Build. Deploy.',
      supportEmail: 'support@vswdata.com',
      allowSignups: true,
      freeTierAIQuestionsLimit: 10
    };

    return {
      users: [adminUser, proUser, freeUser],
      plans: [starterPlan, professionalPlan, premiumPlan],
      subscriptions: [initialSubscription],
      payments: [initialPayment],
      projects,
      categories,
      coupons,
      aiUsage: [],
      banners,
      homepage,
      notifications,
      auditLogs,
      gatewayConfig,
      settings
    };
  }
}

export const db = new Database();
