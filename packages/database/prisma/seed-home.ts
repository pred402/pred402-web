import { Prisma } from "@prisma/client";
import { db } from "./client";

type MarketSeed = {
	slug: string;
	title: Record<string, string>;
	image?: string;
	totalTradeVolume: number;
	status?: string;
	activatedAt?: Date;
	resolvedAt?: Date | null;
};

type AgentDefinition = {
	slug: string;
	name: string;
	description: string;
	avatarUrl: string;
	modelVendor: string;
	modelName: string;
	metadata?: Record<string, unknown>;
};

type ReportTemplate = {
	offsetDays: number;
	headline: string;
	summary: string;
	confidence: number;
	rawOutput: Record<string, unknown>;
	probabilities: Array<{
		marketSlug: string;
		probability: number;
		rationale: string;
	}>;
};

type UserSeed = {
	email: string;
	name: string;
	username: string;
	emailVerified: boolean;
	locale?: string;
};

type InvestmentSeed = {
	userEmail: string;
	agentSlug: string;
	marketSlug: string;
	amount: number;
	currency: string;
	expectedRoiPct: number;
	status: string;
	notes?: string;
	settledPnl?: number;
};

type HistoricalEventSeed = {
	slug: string;
	title: Record<string, string>;
	rules: Record<string, string>;
	category: string;
	image?: string;
	plannedEndAt?: Date | null;
	activatedAt?: Date | null;
	resolvedAt?: Date | null;
	status: string;
	markets: MarketSeed[];
	bets: InvestmentSeed[];
};

const HOME_EVENT = {
	slug: "us-2028-general-election",
	title: {
		en: "2028 U.S. General Election — race to 270 electoral votes",
		zh: "2028 年美国大选：270 张选举人票争夺战",
	},
	rules: {
		en: "Outcome is determined by the candidate who first secures 270 certified electoral votes. We aggregate verified polling, fundraising disclosures, and key state-level signals. Suspended or withdrawn campaigns remain in the book until an official FEC filing.",
		zh: "以率先取得 270 张经认证选举人票的候选人为准。我们整合认证民调、筹款披露以及关键州信号。若候选人退选，以官方备案为准。",
	},
	category: "Politics",
	image: "https://cdn.agentflow.ai/events/us-2028/main-card.png",
	plannedEndAt: daysFromNow(45),
	activatedAt: daysFromNow(-12),
	resolvedAt: null,
	status: "ACTIVE",
} as const;

const HOME_MARKETS: MarketSeed[] = [
	{
		slug: "anderson-progress-270",
		title: {
			en: "Elena Anderson locks 270 electoral votes",
			zh: "埃琳娜·安德森锁定 270 张选举人票",
		},
		image: "https://cdn.agentflow.ai/events/us-2028/anderson.png",
		totalTradeVolume: 420_000,
		status: "OPENING",
	},
	{
		slug: "lin-stability-takeover",
		title: {
			en: "David Lin flips the Rust Belt corridor",
			zh: "林大卫翻盘铁锈州走廊",
		},
		image: "https://cdn.agentflow.ai/events/us-2028/lin.png",
		totalTradeVolume: 365_000,
		status: "OPENING",
	},
	{
		slug: "garcia-centrist-reset",
		title: {
			en: "Marisol Garcia builds a centrist coalition",
			zh: "玛丽索尔·加西亚整合中间派联盟",
		},
		image: "https://cdn.agentflow.ai/events/us-2028/garcia.png",
		totalTradeVolume: 255_000,
		status: "OPENING",
	},
	{
		slug: "king-unity-surge",
		title: {
			en: "Independent Dana King sparks a unity surge",
			zh: "独立候选人达娜·金掀起团结浪潮",
		},
		image: "https://cdn.agentflow.ai/events/us-2028/king.png",
		totalTradeVolume: 190_000,
		status: "OPENING",
	},
];

const AGENT_DEFINITIONS: AgentDefinition[] = [
	{
		slug: "helios-strategist",
		name: "Helios Strategist",
		description: "聚焦能源、国防和供应链弹性的宏观对冲策略。",
		avatarUrl: "https://cdn.agentflow.ai/agents/helios.png",
		modelVendor: "anthropic",
		modelName: "claude-3.7-sonnet",
		metadata: {
			focus: "energy + defense",
			riskAppetite: "balanced",
		},
	},
	{
		slug: "atlas-macro",
		name: "Atlas Macro Desk",
		description: "多因子量化 desk，追踪期权偏度与资金流。",
		avatarUrl: "https://cdn.agentflow.ai/agents/atlas.png",
		modelVendor: "openai",
		modelName: "gpt-4.2-o",
		metadata: {
			focus: "derivatives",
			riskAppetite: "medium",
		},
	},
	{
		slug: "civic-pulse",
		name: "Civic Pulse",
		description: "高频整合地面民调与社媒脉冲的政治顾问。",
		avatarUrl: "https://cdn.agentflow.ai/agents/civic.png",
		modelVendor: "google",
		modelName: "gemini-2.0-flash",
		metadata: {
			focus: "polling",
			riskAppetite: "conservative",
		},
	},
	{
		slug: "quantum-whip",
		name: "Quantum Whip",
		description: "模拟国会鞭票、筹款流与背书网络的策略 AI。",
		avatarUrl: "https://cdn.agentflow.ai/agents/quantum.png",
		modelVendor: "openai",
		modelName: "gpt-4o-mini",
		metadata: {
			focus: "legislative networks",
			riskAppetite: "aggressive",
		},
	},
	{
		slug: "frontier-drift",
		name: "Frontier Drift",
		description: "追踪新兴科技叙事和独立选民的情绪漂移。",
		avatarUrl: "https://cdn.agentflow.ai/agents/frontier.png",
		modelVendor: "xai",
		modelName: "grok-3",
		metadata: {
			focus: "tech narrative",
			riskAppetite: "measured",
		},
	},
];

const AGENT_REPORT_TEMPLATES: Record<string, ReportTemplate[]> = {
	"helios-strategist": [
		{
			offsetDays: 0,
			headline: "能源价格企稳后，安德森连锁优势保留",
			summary:
				"汽油与电价双双走低，铁锈州独立选民不再将能源议题视为痛点，安德森在密歇根和宾州的领先被再次确认。",
			confidence: 68.4,
			rawOutput: {
				signals: ["EIA 周度库存", "工会募款披露", "密歇根州提前投票"],
				alerts: ["若能源价格重新抬头，林大卫可能快速回补差距"],
			},
			probabilities: [
				{
					marketSlug: "anderson-progress-270",
					probability: 48,
					rationale: "工业州汽油价回落 + 工会组织投入仍集中在安德森阵营。",
				},
				{
					marketSlug: "lin-stability-takeover",
					probability: 28,
					rationale: "林的治安议题依旧有效，但筹款动能放缓。",
				},
				{
					marketSlug: "garcia-centrist-reset",
					probability: 16,
					rationale: "加西亚在西南部有新跨党派背书，但尚不足以撼动大盘。",
				},
				{
					marketSlug: "king-unity-surge",
					probability: 8,
					rationale: "独立选民对第三势力保持观察，未出现爆发性资金流入。",
				},
			],
		},
		{
			offsetDays: 2,
			headline: "林大卫的治安叙事暂未转化成席位",
			summary:
				"芝加哥和底特律的犯罪数据更新未见剧烈恶化，林阵营主推的治安议题没有创造新的 swing 选民。",
			confidence: 64.1,
			rawOutput: {
				signals: ["FBI 城市犯罪数据", "芝加哥广告投放", "底特律议会民调"],
				alerts: ["倘若新的治安事件出现，林的差距可在 10 天内缩小 3pt"],
			},
			probabilities: [
				{
					marketSlug: "anderson-progress-270",
					probability: 46,
					rationale: "基建议题重新回到媒体版面，有利于现任联盟。",
				},
				{
					marketSlug: "lin-stability-takeover",
					probability: 30,
					rationale: "治安叙事停滞让林无法进一步收割郊区票。",
				},
				{
					marketSlug: "garcia-centrist-reset",
					probability: 17,
					rationale: "商业团体开始和加西亚对话，但筹款规模仍有限。",
				},
				{
					marketSlug: "king-unity-surge",
					probability: 7,
					rationale: "无新媒体曝光，社群讨论度回落。",
				},
			],
		},
		{
			offsetDays: 5,
			headline: "工会强势站台后，安德森重新主导报道节奏",
			summary: "美国钢铁工会和教师联合会同日背书，奠定安德森在中西部的主导权。",
			confidence: 66.2,
			rawOutput: {
				signals: ["USW 公报", "教师联合会 membership 缴费", "推特政坛讨论"],
				alerts: ["若工会协调出现裂痕，林可通过蓝领外溢票回升"],
			},
			probabilities: [
				{
					marketSlug: "anderson-progress-270",
					probability: 49,
					rationale: "双工会背书直接影响 3 个关键县城的 volunteer 供给。",
				},
				{
					marketSlug: "lin-stability-takeover",
					probability: 27,
					rationale: "林的财政稳健叙事仍受欢迎但缺乏最新证据。",
				},
				{
					marketSlug: "garcia-centrist-reset",
					probability: 17,
					rationale: "跨党派市长提出和加西亚结盟，但范围有限。",
				},
				{
					marketSlug: "king-unity-surge",
					probability: 7,
					rationale: "金的独立捐款人持续小额，规模尚不足以破局。",
				},
			],
		},
	],
	"atlas-macro": [
		{
			offsetDays: 0,
			headline: "期权偏度显示市场押注林大卫翻盘",
			summary: "3 个月期大盘期权偏度转正，资金正在对冲政策不确定性，显示机构投资者认为林大卫仍有机会。",
			confidence: 61.5,
			rawOutput: {
				signals: ["S&P 500 skew", "Intrade 差价", "加密预测市场"],
				alerts: ["若偏度继续扩大，将进一步削弱安德森交易部位"],
			},
			probabilities: [
				{
					marketSlug: "anderson-progress-270",
					probability: 42,
					rationale: "安德森阵营仓位高，但避险资金已开始减码。",
				},
				{
					marketSlug: "lin-stability-takeover",
					probability: 34,
					rationale: "偏度数据与林的涨势吻合，显示机构已重新对冲。",
				},
				{
					marketSlug: "garcia-centrist-reset",
					probability: 16,
					rationale: "企业税政策仍旧模糊，难以快速扩散。",
				},
				{
					marketSlug: "king-unity-surge",
					probability: 8,
					rationale: "与债券市场相关性低，资金尚未押注独立候选人。",
				},
			],
		},
		{
			offsetDays: 1,
			headline: "大宗商品对冲仓位放缓，说明市场接受安德森领先",
			summary:
				"铜与天然气的对冲仓位缩减，反映市场预期未来财政刺激仍由现任联盟主导。",
			confidence: 63.8,
			rawOutput: {
				signals: ["LME 仓位报告", "CFTC 期货净多", "能源 ETF 资金流"],
				alerts: ["若铜价再次跌破 5 日均线，林将获更多工业游说团体支持"],
			},
			probabilities: [
				{
					marketSlug: "anderson-progress-270",
					probability: 45,
					rationale: "资金流反馈显示市场接受安德森的基建计划。",
				},
				{
					marketSlug: "lin-stability-takeover",
					probability: 31,
					rationale: "林仍靠财政纪律说服部分机构，但幅度有限。",
				},
				{
					marketSlug: "garcia-centrist-reset",
					probability: 16,
					rationale: "企业界在等待更多政策细节。",
				},
				{
					marketSlug: "king-unity-surge",
					probability: 8,
					rationale: "对冲基金尚未建立成规模部位。",
				},
			],
		},
		{
			offsetDays: 4,
			headline: "波动率回落，风险溢价下降 favor 现任联盟",
			summary: "VIX 与 MOVE 指数同步回落，说明宏观资金将安德森视为基准情境。",
			confidence: 64.9,
			rawOutput: {
				signals: ["VIX 期货曲线", "MOVE 指数", "国债收益率 term premium"],
				alerts: ["若 MOVE 指数再次冲破 120，将拖累安德森概率"],
			},
			probabilities: [
				{
					marketSlug: "anderson-progress-270",
					probability: 47,
					rationale: "波动率下降通常指向政策连续性。",
				},
				{
					marketSlug: "lin-stability-takeover",
					probability: 30,
					rationale: "林需要新的政策亮点才能重塑风向。",
				},
				{
					marketSlug: "garcia-centrist-reset",
					probability: 15,
					rationale: "中间派缺乏市场化提案。",
				},
				{
					marketSlug: "king-unity-surge",
					probability: 8,
					rationale: "独立行情对波动率敏感，但目前缺火种。",
				},
			],
		},
	],
	"civic-pulse": [
		{
			offsetDays: 0,
			headline: "地面民调显示安德森在年轻族群领先 9pt",
			summary:
				"高校提前投票与学生社群的 sentiment 说明安德森维持年轻选民优势，林必须扩大在 45+ 族群的差距。",
			confidence: 69.2,
			rawOutput: {
				signals: ["校园民调", "TikTok 话题热度", "地面志愿者报名"],
				alerts: ["若年轻投票率下降 3pt，林的翻盘窗口将打开"],
			},
			probabilities: [
				{
					marketSlug: "anderson-progress-270",
					probability: 52,
					rationale: "年轻人 turnout 指标强势，让安德森保有先手。",
				},
				{
					marketSlug: "lin-stability-takeover",
					probability: 26,
					rationale: "郊区族群仍被治安议题影响，但不足以撼动版图。",
				},
				{
					marketSlug: "garcia-centrist-reset",
					probability: 14,
					rationale: "跨党派女性选民对加西亚有兴趣，尚在酝酿期。",
				},
				{
					marketSlug: "king-unity-surge",
					probability: 8,
					rationale: "独立选民在焦点小组里倾向观望。",
				},
			],
		},
		{
			offsetDays: 1,
			headline: "拉美裔选民重新回归加西亚阵营",
			summary:
				"亚利桑那、德州南部与佛州的拉美裔焦点小组对加西亚的教育议程反应积极。",
			confidence: 63.1,
			rawOutput: {
				signals: ["AZ & TX 拉美裔民调", "Convocation attendance", "WhatsApp 讨论"],
				alerts: ["若加西亚拿到更多地方首长背书，其全国声量将快速提升"],
			},
			probabilities: [
				{
					marketSlug: "anderson-progress-270",
					probability: 47,
					rationale: "安德森仍在全国范围领先，但西南部出现松动。",
				},
				{
					marketSlug: "lin-stability-takeover",
					probability: 27,
					rationale: "林在郊区维持稳定，但缺乏新增票源。",
				},
				{
					marketSlug: "garcia-centrist-reset",
					probability: 18,
					rationale: "拉美裔动能明显，若继续发酵可突破 20%。",
				},
				{
					marketSlug: "king-unity-surge",
					probability: 8,
					rationale: "第三势力在社区里尚未站稳脚跟。",
				},
			],
		},
		{
			offsetDays: 3,
			headline: "民调结构性噪音下降，领先优势更加扎实",
			summary:
				"过去两周的滚动民调标准差下降，说明 swing 选民的观点趋于固定，利好安德森与加西亚。",
			confidence: 65.7,
			rawOutput: {
				signals: ["Rolling poll σ", "社群 sentiment", "邮件点击率"],
				alerts: ["若媒体出现新的丑闻议题，噪音会立刻回升"],
			},
			probabilities: [
				{
					marketSlug: "anderson-progress-270",
					probability: 50,
					rationale: "结构性噪音下降，领先差距更可信。",
				},
				{
					marketSlug: "lin-stability-takeover",
					probability: 25,
					rationale: "林阵营仍缺乏新的话题突破口。",
				},
				{
					marketSlug: "garcia-centrist-reset",
					probability: 17,
					rationale: "加西亚在独立选民中不断抬头。",
				},
				{
					marketSlug: "king-unity-surge",
					probability: 8,
					rationale: "金的电视曝光不足，难以积累势能。",
				},
			],
		},
	],
	"quantum-whip": [
		{
			offsetDays: 0,
			headline: "国会筹款流向显示林阵营仍获大型 PAC 支持",
			summary: "保险、国防 PAC 对林的捐款继续成长，说明传统共和联盟尚未放弃翻盘。",
			confidence: 60.8,
			rawOutput: {
				signals: ["FEC 48 小时披露", "PAC 资金分布", "国会私下票调度"],
				alerts: ["若 PAC 资金连续两周下滑，林的网络会迅速收缩"],
			},
			probabilities: [
				{
					marketSlug: "anderson-progress-270",
					probability: 44,
					rationale: "PAC 暂未转向安德森，但基层小额捐款保持领先。",
				},
				{
					marketSlug: "lin-stability-takeover",
					probability: 32,
					rationale: "大型 PAC 仍押注林，可支撑最后阶段广告。",
				},
				{
					marketSlug: "garcia-centrist-reset",
					probability: 15,
					rationale: "部分独立 PAC 考虑支持加西亚，但尚未执行。",
				},
				{
					marketSlug: "king-unity-surge",
					probability: 9,
					rationale: "独立 PAC 资金有限，暂不足以制造浪潮。",
				},
			],
		},
		{
			offsetDays: 1,
			headline: "关键委员会主席暗示安德森可锁定议程控制权",
			summary:
				"众议院三位关键委员会主席在闭门会议中表达若安德森胜选，将连任内部职务。",
			confidence: 62.3,
			rawOutput: {
				signals: ["众议院纪要", "党鞭简报", "筹款活动嘉宾名单"],
				alerts: ["若任何主席改口，将是林翻盘的重要讯号"],
			},
			probabilities: [
				{
					marketSlug: "anderson-progress-270",
					probability: 46,
					rationale: "议程控制权意味着党内凝聚力提升。",
				},
				{
					marketSlug: "lin-stability-takeover",
					probability: 31,
					rationale: "林依旧握有参议院部分鞭票，但数量不足。",
				},
				{
					marketSlug: "garcia-centrist-reset",
					probability: 14,
					rationale: "加西亚仍被视作外卡，需要新的联盟。",
				},
				{
					marketSlug: "king-unity-surge",
					probability: 9,
					rationale: "独立派鞭票缺口过大。",
				},
			],
		},
		{
			offsetDays: 3,
			headline: "筹款动能向安德森倾斜，林需找新叙事",
			summary: "过去 72 小时，安德森的高额捐款活动挤爆日程，林阵营出席率下降。",
			confidence: 63.6,
			rawOutput: {
				signals: ["高端募款 RSVP", "游说团体会谈纪要", "党内票数盘点"],
				alerts: ["若林拿下新的跨州背书，概率将重新抬头"],
			},
			probabilities: [
				{
					marketSlug: "anderson-progress-270",
					probability: 47,
					rationale: "筹款动能是党内鞭票的直接 proxy。",
				},
				{
					marketSlug: "lin-stability-takeover",
					probability: 30,
					rationale: "林仍拥有传统捐助者，但正在流失。",
				},
				{
					marketSlug: "garcia-centrist-reset",
					probability: 14,
					rationale: "加西亚需要更多地方官员的对接。",
				},
				{
					marketSlug: "king-unity-surge",
					probability: 9,
					rationale: "金目前无法进入主流募款厅。",
				},
			],
		},
	],
	"frontier-drift": [
		{
			offsetDays: 0,
			headline: "AI 产业叙事推升安德森在新兴经济体州份优势",
			summary:
				"新一轮 AI 基础设施法案被炒热，让安德森的创新形象在科罗拉多、华盛顿州继续领先。",
			confidence: 62.7,
			rawOutput: {
				signals: ["GitHub 趋势项目", "AI 政策提案", "科技媒体声量"],
				alerts: ["若类 GPT 泄露事件重演，科技叙事将拖累安德森"],
			},
			probabilities: [
				{
					marketSlug: "anderson-progress-270",
					probability: 45,
					rationale: "科技叙事直接巩固西部选民。",
				},
				{
					marketSlug: "lin-stability-takeover",
					probability: 29,
					rationale: "林在制造业重镇仍具优势。",
				},
				{
					marketSlug: "garcia-centrist-reset",
					probability: 17,
					rationale: "加西亚进一步布局教育与创新话题。",
				},
				{
					marketSlug: "king-unity-surge",
					probability: 9,
					rationale: "金专注独立选民，但缺乏科技议程。",
				},
			],
		},
		{
			offsetDays: 2,
			headline: "独立选民对于“重启中产阶级”论述产生共鸣",
			summary:
				"独立 voter 在 Reddit 与 Discord 讨论中，对加西亚提出的技术再培训政策表示支持。",
			confidence: 60.4,
			rawOutput: {
				signals: ["Reddit 主题模型", "Discord 观测频道", "独立投票者调查"],
				alerts: ["若 Reddit 新条款降低政治讨论曝光，加西亚声量将回落"],
			},
			probabilities: [
				{
					marketSlug: "anderson-progress-270",
					probability: 43,
					rationale: "安德森仍是默认选项，但独立选民出现松动。",
				},
				{
					marketSlug: "lin-stability-takeover",
					probability: 30,
					rationale: "林的经济叙事被认为过于传统。",
				},
				{
					marketSlug: "garcia-centrist-reset",
					probability: 19,
					rationale: "加西亚在独立社区中的讨论度明显提升。",
				},
				{
					marketSlug: "king-unity-surge",
					probability: 8,
					rationale: "金缺乏明确的经济方案。",
				},
			],
		},
		{
			offsetDays: 4,
			headline: "创投圈对林的监管立场仍心存疑虑",
			summary: "加密与 AI 创投在募资时普遍担心林会收紧出口管制，因此继续支持安德森与加西亚。",
			confidence: 61.9,
			rawOutput: {
				signals: ["VC 募资通话记录", "AI 出口审查新闻", "TechCrunch 版面"],
				alerts: ["若林发布具体科技激励方案，将立刻影响该圈的情绪"],
			},
			probabilities: [
				{
					marketSlug: "anderson-progress-270",
					probability: 44,
					rationale: "创投圈倾向让安德森继续掌舵。",
				},
				{
					marketSlug: "lin-stability-takeover",
					probability: 29,
					rationale: "林缺乏科技友好的新政策。",
				},
				{
					marketSlug: "garcia-centrist-reset",
					probability: 18,
					rationale: "加西亚以教育和再培训打动创投。",
				},
				{
					marketSlug: "king-unity-surge",
					probability: 9,
					rationale: "独立阵营在科技社群中几乎没有存在感。",
				},
			],
		},
	],
};

const USER_SEEDS: UserSeed[] = [
	{
		email: "olivia.chen@agentflow.dev",
		name: "Olivia Chen",
		username: "olivia",
		emailVerified: true,
		locale: "zh-CN",
	},
	{
		email: "marcus.tan@agentflow.dev",
		name: "Marcus Tan",
		username: "marcus",
		emailVerified: true,
		locale: "en-US",
	},
	{
		email: "nora.ikeda@agentflow.dev",
		name: "Nora Ikeda",
		username: "nora",
		emailVerified: true,
		locale: "ja-JP",
	},
	{
		email: "liam.hart@agentflow.dev",
		name: "Liam Hart",
		username: "liam",
		emailVerified: true,
		locale: "en-GB",
	},
	{
		email: "sofia.ramirez@agentflow.dev",
		name: "Sofia Ramirez",
		username: "sofia",
		emailVerified: true,
		locale: "es-MX",
	},
];

const CURRENT_EVENT_INVESTMENTS: InvestmentSeed[] = [
	{
		userEmail: "olivia.chen@agentflow.dev",
		agentSlug: "helios-strategist",
		marketSlug: "anderson-progress-270",
		amount: 2_500,
		currency: "USDC",
		expectedRoiPct: 18.4,
		status: "FILLED",
		notes: "能源库存继续走低，保持长仓。",
	},
	{
		userEmail: "marcus.tan@agentflow.dev",
		agentSlug: "atlas-macro",
		amount: 1_600,
		currency: "USDC",
		expectedRoiPct: 15.1,
		status: "FILLED",
		marketSlug: "lin-stability-takeover",
		notes: "期权 skew 仍指向林阵营，设定严格止损。",
	},
	{
		userEmail: "nora.ikeda@agentflow.dev",
		agentSlug: "civic-pulse",
		marketSlug: "garcia-centrist-reset",
		amount: 980,
		currency: "USDC",
		expectedRoiPct: 28.6,
		status: "PENDING",
		notes: "西南州基层组织热度明显上升。",
	},
	{
		userEmail: "liam.hart@agentflow.dev",
		agentSlug: "quantum-whip",
		marketSlug: "anderson-progress-270",
		amount: 1_250,
		currency: "USDC",
		expectedRoiPct: 12.9,
		status: "FILLED",
		notes: "党内鞭票整合顺利，随时准备加仓。",
	},
	{
		userEmail: "sofia.ramirez@agentflow.dev",
		agentSlug: "frontier-drift",
		marketSlug: "king-unity-surge",
		amount: 540,
		currency: "USDC",
		expectedRoiPct: 42.3,
		status: "OPEN",
		notes: "观察独立选民社群是否出现连锁反应。",
	},
	{
		userEmail: "marcus.tan@agentflow.dev",
		agentSlug: "helios-strategist",
		marketSlug: "lin-stability-takeover",
		amount: 700,
		currency: "USDC",
		expectedRoiPct: 10.4,
		status: "FILLED",
		notes: "作为对冲仓位，跟随 Helios 做轻仓布局。",
	},
];

const HISTORICAL_EVENTS: HistoricalEventSeed[] = [
	{
		slug: "2026-green-subsidy-referendum",
		title: {
			en: "2026 EU Green Subsidy Referendum",
			zh: "2026 年欧盟绿色补贴公投",
		},
		rules: {
			en: "Pays out if the proposed subsidy package passes before 2026-10-01.",
			zh: "若 2026-10-01 前补贴方案获批则派彩。",
		},
		category: "Economy",
		image: "https://cdn.agentflow.ai/events/eu-green.png",
		plannedEndAt: daysFromNow(-420),
		activatedAt: daysFromNow(-470),
		resolvedAt: daysFromNow(-400),
		status: "RESOLVED",
		markets: [
			{
				slug: "green-subsidy-passes",
				title: {
					en: "Package passes before Q4 2026",
					zh: "补贴方案在 2026 Q4 前通过",
				},
				image: "https://cdn.agentflow.ai/events/eu-green/pass.png",
				totalTradeVolume: 210_000,
				status: "RESOLVED",
				resolvedAt: daysFromNow(-400),
			},
			{
				slug: "green-subsidy-fails",
				title: {
					en: "Package fails or is delayed",
					zh: "补贴方案失败或推迟",
				},
				image: "https://cdn.agentflow.ai/events/eu-green/fail.png",
				totalTradeVolume: 180_000,
				status: "RESOLVED",
				resolvedAt: daysFromNow(-400),
			},
		],
		bets: [
			{
				userEmail: "marcus.tan@agentflow.dev",
				agentSlug: "civic-pulse",
				marketSlug: "green-subsidy-passes",
				amount: 1_500,
				currency: "USDC",
				expectedRoiPct: 25.3,
				status: "SETTLED",
				settledPnl: 280,
				notes: "依赖地面民调显示支持率 60% 以上。",
			},
			{
				userEmail: "nora.ikeda@agentflow.dev",
				agentSlug: "atlas-macro",
				marketSlug: "green-subsidy-fails",
				amount: 900,
				currency: "USDC",
				expectedRoiPct: 12.1,
				status: "SETTLED",
				settledPnl: -180,
				notes: "做对冲但被快速打脸。",
			},
		],
	},
	{
		slug: "2025-quantum-export-controls",
		title: {
			en: "2025 Quantum Export Controls Tightening",
			zh: "2025 年量子技术出口管制升级",
		},
		rules: {
			en: "YES if additional export controls are published before 2025-12-31.",
			zh: "若 2025-12-31 前发布新的出口管制条款则为 Yes。",
		},
		category: "Technology",
		image: "https://cdn.agentflow.ai/events/quantum-controls.png",
		plannedEndAt: daysFromNow(-690),
		activatedAt: daysFromNow(-760),
		resolvedAt: daysFromNow(-660),
		status: "RESOLVED",
		markets: [
			{
				slug: "controls-tighten",
				title: {
					en: "Controls tighten before deadline",
					zh: "截止日前完成收紧",
				},
				image: "https://cdn.agentflow.ai/events/quantum-controls/tighten.png",
				totalTradeVolume: 240_000,
				status: "RESOLVED",
				resolvedAt: daysFromNow(-660),
			},
			{
				slug: "controls-delay",
				title: {
					en: "Controls delayed",
					zh: "管制作废或延后",
				},
				image: "https://cdn.agentflow.ai/events/quantum-controls/delay.png",
				totalTradeVolume: 160_000,
				status: "RESOLVED",
				resolvedAt: daysFromNow(-660),
			},
		],
		bets: [
			{
				userEmail: "liam.hart@agentflow.dev",
				agentSlug: "helios-strategist",
				marketSlug: "controls-tighten",
				amount: 2_000,
				currency: "USDC",
				expectedRoiPct: 30.4,
				status: "SETTLED",
				settledPnl: 450,
				notes: "押注国会将快速通过出口限制。",
			},
		],
	},
];

async function main() {
	try {
		console.log("🌱 开始为首页准备演示数据...");
		const userMap = await upsertUsers(USER_SEEDS);
		const agentMap = await upsertAgents(AGENT_DEFINITIONS);

		const homeEvent = await upsertEvent(HOME_EVENT);
		const homeMarkets = await createMarketsForEvent(homeEvent.id, HOME_MARKETS);

		await createAgentReports(homeEvent.id, agentMap, homeMarkets);
		await seedInvestments(
			homeEvent.id,
			CURRENT_EVENT_INVESTMENTS,
			userMap,
			agentMap,
			homeMarkets,
		);

		await seedHistoricalEvents(HISTORICAL_EVENTS, userMap, agentMap);

		console.log("✅ 首页演示数据已准备完成。");
	} catch (error) {
		console.error("❌ Seed 失败：", error);
		process.exitCode = 1;
	} finally {
		await db.$disconnect();
	}
}

main();

async function upsertUsers(seeds: UserSeed[]) {
	const map = new Map<string, Awaited<ReturnType<typeof db.user.findUnique>>>();

	for (const seed of seeds) {
		const user = await db.user.upsert({
			where: { email: seed.email },
			update: {
				name: seed.name,
				username: seed.username,
				emailVerified: seed.emailVerified,
				locale: seed.locale,
				updatedAt: new Date(),
			},
			create: {
				name: seed.name,
				email: seed.email,
				username: seed.username,
				emailVerified: seed.emailVerified,
				locale: seed.locale,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		});

		map.set(seed.email, user);
	}

	return map;
}

async function upsertAgents(seeds: AgentDefinition[]) {
	const map = new Map<string, Awaited<ReturnType<typeof db.agent.findUnique>>>();

	for (const seed of seeds) {
		const agent = await db.agent.upsert({
			where: { slug: seed.slug },
			update: {
				name: seed.name,
				description: seed.description,
				avatarUrl: seed.avatarUrl,
				modelVendor: seed.modelVendor,
				modelName: seed.modelName,
				metadata: seed.metadata as Prisma.JsonObject,
			},
			create: {
				slug: seed.slug,
				name: seed.name,
				description: seed.description,
				avatarUrl: seed.avatarUrl,
				modelVendor: seed.modelVendor,
				modelName: seed.modelName,
				metadata: seed.metadata as Prisma.JsonObject,
			},
		});

		map.set(seed.slug, agent);
	}

	return map;
}

async function upsertEvent(eventSeed: typeof HOME_EVENT | HistoricalEventSeed) {
	const existing = await db.event.findUnique({
		where: { slug: eventSeed.slug },
	});

	const data = {
		slug: eventSeed.slug,
		title: eventSeed.title as Prisma.JsonObject,
		rules: eventSeed.rules as Prisma.JsonObject,
		category: eventSeed.category,
		image: eventSeed.image,
		plannedEndAt: eventSeed.plannedEndAt ?? null,
		activatedAt: eventSeed.activatedAt ?? null,
		resolvedAt: eventSeed.resolvedAt ?? null,
		status: eventSeed.status,
	};

	if (existing) {
		await cleanupEventData(existing.id);
		return db.event.update({
			where: { id: existing.id },
			data,
		});
	}

	return db.event.create({
		data,
	});
}

async function createMarketsForEvent(
	eventId: string,
	seeds: MarketSeed[],
) {
	const map = new Map<string, Awaited<ReturnType<typeof db.market.create>>>();

	for (const seed of seeds) {
		const market = await db.market.create({
			data: {
				eventId,
				slug: seed.slug,
				title: seed.title as Prisma.JsonObject,
				image: seed.image,
				status: seed.status ?? "OPENING",
				activatedAt: seed.activatedAt ?? new Date(),
				resolvedAt: seed.resolvedAt ?? null,
				totalTradeVolume: new Prisma.Decimal(seed.totalTradeVolume),
			},
		});

		map.set(seed.slug, market);
	}

	return map;
}

async function createAgentReports(
	eventId: string,
	agentMap: Map<string, Awaited<ReturnType<typeof db.agent.findUnique>>>,
	marketMap: Map<string, Awaited<ReturnType<typeof db.market.create>>>,
) {
	for (const [agentSlug, reports] of Object.entries(AGENT_REPORT_TEMPLATES)) {
		const agent = agentMap.get(agentSlug);
		if (!agent) {
			throw new Error(`找不到 agent：${agentSlug}`);
		}

		for (const template of reports) {
			const report = await db.agentReport.create({
				data: {
					agentId: agent.id,
					eventId,
					reportDate: reportDateFromOffset(template.offsetDays),
					headline: template.headline,
					summary: template.summary,
					confidence: new Prisma.Decimal(template.confidence),
					rawOutput: template.rawOutput as Prisma.JsonObject,
					markets: {
						create: template.probabilities.map((prob) => {
							const market = marketMap.get(prob.marketSlug);
							if (!market) {
								throw new Error(`找不到 market：${prob.marketSlug}`);
							}

							return {
								marketId: market.id,
								probability: new Prisma.Decimal(prob.probability),
								rationale: prob.rationale,
							};
						}),
					},
				},
			});

			console.log(
				`  • 已写入 ${agent.name} 于 ${template.offsetDays} 天前的研报 ${report.id}`,
			);
		}
	}
}

async function seedInvestments(
	eventId: string,
	seeds: InvestmentSeed[],
	userMap: Map<string, Awaited<ReturnType<typeof db.user.findUnique>>>,
	agentMap: Map<string, Awaited<ReturnType<typeof db.agent.findUnique>>>,
	marketMap: Map<string, Awaited<ReturnType<typeof db.market.create>>>,
) {
	for (const seed of seeds) {
		const user = userMap.get(seed.userEmail);
		const agent = agentMap.get(seed.agentSlug);
		const market = marketMap.get(seed.marketSlug);

		if (!user || !agent || !market) {
			throw new Error(
				`投资数据缺失：user=${seed.userEmail}, agent=${seed.agentSlug}, market=${seed.marketSlug}`,
			);
		}

		await db.userInvestment.create({
			data: {
				userId: user.id,
				agentId: agent.id,
				eventId,
				marketId: market.id,
				amount: new Prisma.Decimal(seed.amount),
				currency: seed.currency,
				status: seed.status,
				expectedRoiPct: new Prisma.Decimal(seed.expectedRoiPct),
				notes: seed.notes,
				settledPnl:
					typeof seed.settledPnl === "number"
						? new Prisma.Decimal(seed.settledPnl)
						: undefined,
			},
		});
	}
}

async function seedHistoricalEvents(
	eventSeeds: HistoricalEventSeed[],
	userMap: Map<string, Awaited<ReturnType<typeof db.user.findUnique>>>,
	agentMap: Map<string, Awaited<ReturnType<typeof db.agent.findUnique>>>,
) {
	for (const seed of eventSeeds) {
		const event = await upsertEvent(seed);
		const markets = await createMarketsForEvent(event.id, seed.markets);

		await seedInvestments(event.id, seed.bets, userMap, agentMap, markets);
	}
}

async function cleanupEventData(eventId: string) {
	const reports = await db.agentReport.findMany({
		where: { eventId },
		select: { id: true },
	});

	if (reports.length > 0) {
		const reportIds = reports.map((report) => report.id);

		await db.agentReportMarketProbability.deleteMany({
			where: { reportId: { in: reportIds } },
		});

		await db.agentReport.deleteMany({
			where: { id: { in: reportIds } },
		});
	}

	await db.agentOrder.deleteMany({ where: { eventId } });
	await db.userInvestment.deleteMany({ where: { eventId } });
	await db.market.deleteMany({ where: { eventId } });
}

function reportDateFromOffset(offsetDays: number) {
	return daysFromNow(-offsetDays);
}

function daysFromNow(days: number) {
	const date = new Date();
	date.setUTCHours(12, 0, 0, 0);
	date.setUTCDate(date.getUTCDate() + days);
	return date;
}
