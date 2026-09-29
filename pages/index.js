import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Mousewheel } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  LineController,
} from 'chart.js'

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, LineController)

// ─────────────────────────────────────────────
// DATA GENERATORS
// ─────────────────────────────────────────────

const generateFollowerData = () => {
  const points = []
  let value = 20000

  for (let i = 0; i < 80; i++) {
    if (i === 15) {
      value = 140800
    } else if (i > 15 && i < 25) {
      value = 140800 - (i - 15) * 8000
    } else if (i >= 25) {
      value = Math.max(15000, value + (Math.random() - 0.52) * 3000)
    } else {
      value += Math.random() * 2000
    }
    points.push(Math.round(value))
  }

  return points
}

const generateEngagementData = () => {
  const points = []
  let value = 2

  for (let i = 0; i < 80; i++) {
    if (i === 15) {
      value = 8.5
    } else if (i > 15 && i < 22) {
      value = 8.5 - (i - 15) * 0.8
    } else {
      value = Math.max(0.5, value + (Math.random() - 0.52) * 0.3)
    }
    points.push(parseFloat(value.toFixed(2)))
  }

  return points
}

// ─────────────────────────────────────────────
// CHART LABELS
// We still need labels array for Chart.js internally,
// but we hide them all from the UI
// ─────────────────────────────────────────────

const years = ['2020', '2021', '2022', '2023', '2024', '2025', '2026']

const generateChartLabels = () => {
  const labels = []
  for (let i = 0; i < 80; i++) {
    const yearIndex = Math.floor((i / 79) * (years.length - 1))
    labels.push(years[yearIndex])
  }
  return labels
}

const chartLabels = generateChartLabels()

// ─────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────

// Mock scraped Instagram posts shown in the swiper
// In a real app this data comes from your scraping API
const mockScrapedPosts = [
  {
    id: 1,
    rank: 1,
    gradientFrom: '#f0e9b5',
    gradientTo: '#92b2dc',
    username: '@nikefuel',
    caption: 'Just do it. Every single day, no excuses. 💪 #Nike #JustDoIt #Fitness',
    likes: '284K',
    comments: '3.2K',
    engagementRate: '8.4%',
    postType: 'REEL',
    isSponsored: true,
    brand: 'NIKE',
    postedAt: '2 days ago',
  },
  {
    id: 2,
    rank: 2,
    gradientFrom: '#edf2e8',
    gradientTo: '#ee684d',
    username: '@lifestylebyjane',
    caption: 'Morning routine ft. my new favorite gear. This changed everything for me ✨',
    likes: '198K',
    comments: '1.8K',
    engagementRate: '7.1%',
    postType: 'REEL',
    isSponsored: false,
    brand: null,
    postedAt: '5 days ago',
  },
  {
    id: 3,
    rank: 3,
    gradientFrom: '#fdf8f0',
    gradientTo: '#6a90bf',
    username: '@foodwithmark',
    caption: "The best pickle I've ever had, no cap. @grillos never disappoints 🥒",
    likes: '142K',
    comments: '4.1K',
    engagementRate: '6.8%',
    postType: 'PHOTO',
    isSponsored: true,
    brand: "GRILLO'S",
    postedAt: '1 week ago',
  },
  {
    id: 4,
    rank: 4,
    gradientFrom: '#f0e9b5',
    gradientTo: '#4a7c3f',
    username: '@techwithtom',
    caption: "Honest review after 30 days. Here's what nobody tells you about this product...",
    likes: '117K',
    comments: '2.9K',
    engagementRate: '5.9%',
    postType: 'VIDEO',
    isSponsored: false,
    brand: null,
    postedAt: '1 week ago',
  },
  {
    id: 5,
    rank: 5,
    gradientFrom: '#fdf8f0',
    gradientTo: '#ee684d',
    username: '@dunkinofficial',
    caption: 'New season, new flavors. Which one are you getting first? ☕🍩 #Dunkin',
    likes: '98K',
    comments: '5.6K',
    engagementRate: '5.2%',
    postType: 'PHOTO',
    isSponsored: true,
    brand: 'DUNKIN',
    postedAt: '2 weeks ago',
  },
  {
    id: 6,
    rank: 6,
    gradientFrom: '#edeae0',
    gradientTo: '#92b2dc',
    username: '@minimalistliving',
    caption: 'Small space, big life. How I redesigned my apartment with @IKEA pieces under $200',
    likes: '87K',
    comments: '1.4K',
    engagementRate: '4.7%',
    postType: 'CAROUSEL',
    isSponsored: true,
    brand: 'IKEA',
    postedAt: '2 weeks ago',
  },
  {
    id: 7,
    rank: 7,
    gradientFrom: '#edf2e8',
    gradientTo: '#f0e9b5',
    username: '@beautybyalex',
    caption: 'Get ready with me for date night 💄 Full routine linked in bio',
    likes: '76K',
    comments: '920',
    engagementRate: '4.3%',
    postType: 'REEL',
    isSponsored: false,
    brand: null,
    postedAt: '3 weeks ago',
  },
  {
    id: 8,
    rank: 8,
    gradientFrom: '#fdf8f0',
    gradientTo: '#4a7c3f',
    username: '@travelwithsam',
    caption: 'Hidden gem in Bali that most tourists never find 🌴 Save this for your trip!',
    likes: '64K',
    comments: '2.1K',
    engagementRate: '3.9%',
    postType: 'CAROUSEL',
    isSponsored: false,
    brand: null,
    postedAt: '3 weeks ago',
  },
  {
    id: 9,
    rank: 9,
    gradientFrom: '#f0e9b5',
    gradientTo: '#ee684d',
    username: '@fitnesscoach_jay',
    caption: 'The only ab workout you need. 10 minutes, zero equipment, maximum results 🔥',
    likes: '51K',
    comments: '780',
    engagementRate: '3.4%',
    postType: 'REEL',
    isSponsored: false,
    brand: null,
    postedAt: '1 month ago',
  },
  {
    id: 10,
    rank: 10,
    gradientFrom: '#edeae0',
    gradientTo: '#6a90bf',
    username: '@gamingwithkai',
    caption: "I played this for 48 hours straight. Here's my honest take 🎮 #Gaming",
    likes: '44K',
    comments: '3.3K',
    engagementRate: '3.1%',
    postType: 'VIDEO',
    isSponsored: false,
    brand: null,
    postedAt: '1 month ago',
  },
]

// Color scheme for each post type badge
const postTypeColors = {
  REEL:     { bg: '#ee684d', text: '#fff'    },
  PHOTO:    { bg: '#92b2dc', text: '#fff'    },
  VIDEO:    { bg: '#4a7c3f', text: '#fff'    },
  CAROUSEL: { bg: '#f0e9b5', text: '#2c2416' },
}

const objectiveOptions = [
  { value: 'brand_awareness', label: 'AWARENESS'      },
  { value: 'direct_sales',    label: 'DIRECT SALES'   },
  { value: 'brand_building',  label: 'BRAND BUILDING' },
  { value: 'lead_gen',        label: 'LEAD GEN'       },
]

const nicheOptions = [
  'BEAUTY', 'FITNESS', 'TECH', 'FASHION',
  'FOOD', 'TRAVEL', 'GAMING', 'FINANCE', 'LIFESTYLE', 'OTHER',
]

const processingMessages = [
  'SCRAPING CREATOR PROFILE...',
  'READING LAST 50 POSTS...',
  'ANALYZING SPONSORSHIP HISTORY...',
  'COMPUTING ENGAGEMENT METRICS...',
  'CALCULATING ROI POTENTIAL...',
  'GENERATING INTELLIGENCE REPORT...',
]

// ─────────────────────────────────────────────
// EMPTY FORM STATE
// ─────────────────────────────────────────────

const emptyForm = {
  instagramUrl:  '',
  brandName:     '',
  objective:     '',
  followerCount: '',
  niche:         '',
  avgEngagement: '',
  postFrequency: '',
  examinerNotes: '',
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function InfluencerReceiptTool() {

  // Chart canvas refs — these point to the <canvas> elements
  const followerChartRef   = useRef(null)
  const engagementChartRef = useRef(null)

  // Chart instance refs — kept so we can destroy before recreating
  const followerChartInstance   = useRef(null)
  const engagementChartInstance = useRef(null)

  // Timer ref for the live data animation loop
  const animationTimerRef = useRef(null)

  // Refs for live chart data so updates don't trigger re-renders
  const followerDataRef   = useRef(generateFollowerData())
  const engagementDataRef = useRef(generateEngagementData())

  // Interval ref for the clock
  const clockIntervalRef = useRef(null)

  // ── UI State ──
  const [clockDisplay,      setClockDisplay]      = useState('--:--:--')
  const [brandFitSlider,    setBrandFitSlider]    = useState(12)
  const [isProcessing,      setIsProcessing]      = useState(false)
  const [processingMessage, setProcessingMessage] = useState('ANALYZING...')
  const [filledFieldsMap,   setFilledFieldsMap]   = useState({})
  const [verdictResult,     setVerdictResult]     = useState(null)
  const [stampVisible,      setStampVisible]      = useState(false)
  const [form,              setForm]              = useState(emptyForm)
  const [expandedPostId,    setExpandedPostId]    = useState(null)

  // ─────────────────────────────────────────────
  // CLOCK — updates every second
  // ─────────────────────────────────────────────

  useEffect(() => {
    const updateClock = () => {
      const now     = new Date()
      const hours   = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      setClockDisplay(`${hours}:${minutes}:${seconds}`)
    }

    updateClock()
    clockIntervalRef.current = setInterval(updateClock, 1000)
    return () => clearInterval(clockIntervalRef.current)
  }, [])

  // ─────────────────────────────────────────────
  // CHART CONFIG BUILDER
  // Called once for each chart with its own data + settings
  // ─────────────────────────────────────────────

  const buildChartConfig = (data, maxValue, label, showAsCurrency) => ({
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: [
        {
          // Main filled area line
          label,
          data,
          borderColor: '#92b2dc',
          borderWidth: 2.2,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#92b2dc',
          pointHoverBorderWidth: 2.5,
          fill: true,
          backgroundColor: (ctx) => {
            const canvas   = ctx.chart.ctx
            const gradient = canvas.createLinearGradient(0, 0, 0, ctx.chart.height)
            gradient.addColorStop(0, 'rgba(146,178,220,0.38)')
            gradient.addColorStop(1, 'rgba(146,178,220,0.03)')
            return gradient
          },
          tension: 0,
        },
        {
          // Secondary dashed trend line
          label: 'trend',
          data: data.map((v, i) =>
            parseFloat((v * 0.85 + Math.sin(i * 0.3) * maxValue * 0.02).toFixed(2))
          ),
          borderColor: 'rgba(238,104,77,0.55)',
          borderWidth: 1,
          borderDash: [3, 5],
          pointRadius: 0,
          fill: false,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,

      // Equal padding on all 4 sides so the line never touches the chart edges
      layout: {
        padding: {
          top:    20,
          right:  20,
          bottom: 20,
          left:   20,
        },
      },

      interaction: { mode: 'index', intersect: false },

      scales: {
        x: {
          // Hide all x-axis grid lines
          grid: { display: false },
          border: { display: false },
          // Hide all x-axis labels (2020, 2021, etc.)
          ticks: { display: false },
        },
        y: {
          // Hide the y-axis entirely
          display: false,
          min: 0,
          max: maxValue,
        },
      },

      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#fff',
          borderColor: 'rgba(146,178,220,0.3)',
          borderWidth: 1,
          titleColor: '#5a5040',
          bodyColor: '#2c2416',
          titleFont: { family: 'Inter, sans-serif', size: 11 },
          bodyFont:  { family: 'Inter, sans-serif', size: 14, weight: 'bold' },
          padding: 10,
          cornerRadius: 6,
          caretSize: 4,
          callbacks: {
            // Hide the year from the tooltip title as well
            title: () => '',
            label: (item) => {
              if (item.datasetIndex === 1) return null
              return showAsCurrency
                ? Math.round(item.raw).toLocaleString()
                : item.raw.toFixed(1) + '%'
            },
          },
          filter: (item) => item.datasetIndex === 0,
        },
      },
    },
  })

  // ─────────────────────────────────────────────
  // CHART INIT + LIVE DATA ANIMATION
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (!followerChartRef.current || !engagementChartRef.current) return

    // Always destroy old instances before creating new ones
    if (followerChartInstance.current)   followerChartInstance.current.destroy()
    if (engagementChartInstance.current) engagementChartInstance.current.destroy()

    followerChartInstance.current = new Chart(
      followerChartRef.current,
      buildChartConfig(followerDataRef.current, 160000, 'Followers', true)
    )
    engagementChartInstance.current = new Chart(
      engagementChartRef.current,
      buildChartConfig(engagementDataRef.current, 10, 'Engagement %', false)
    )

    // Nudge chart data slightly every 2 seconds to simulate a live feed
    const animateLiveData = () => {
      followerDataRef.current = followerDataRef.current.map((value, i) =>
        i > 20 ? Math.max(8000, value + (Math.random() - 0.505) * 800) : value
      )
      engagementDataRef.current = engagementDataRef.current.map((value, i) =>
        i > 20 ? parseFloat(Math.max(0.3, value + (Math.random() - 0.505) * 0.15).toFixed(2)) : value
      )

      if (followerChartInstance.current) {
        followerChartInstance.current.data.datasets[0].data = followerDataRef.current
        followerChartInstance.current.data.datasets[1].data = followerDataRef.current.map((v, i) =>
          Math.round(v * 0.85 + Math.sin(i * 0.3) * 160000 * 0.02)
        )
        followerChartInstance.current.update('none')
      }

      if (engagementChartInstance.current) {
        engagementChartInstance.current.data.datasets[0].data = engagementDataRef.current
        engagementChartInstance.current.data.datasets[1].data = engagementDataRef.current.map((v, i) =>
          parseFloat((v * 0.85 + Math.sin(i * 0.3) * 10 * 0.02).toFixed(2))
        )
        engagementChartInstance.current.update('none')
      }

      animationTimerRef.current = setTimeout(animateLiveData, 2000)
    }

    animateLiveData()

    // Clean up charts and timer when component unmounts
    return () => {
      clearTimeout(animationTimerRef.current)
      if (followerChartInstance.current)   followerChartInstance.current.destroy()
      if (engagementChartInstance.current) engagementChartInstance.current.destroy()
    }
  }, [])

  // ─────────────────────────────────────────────
  // FORM HELPERS
  // ─────────────────────────────────────────────

  const formFieldNames = [
    'instagramUrl', 'brandName', 'objective', 'followerCount',
    'niche', 'avgEngagement', 'postFrequency', 'examinerNotes',
  ]

  const handleFieldChange = (fieldName, value) => {
    setForm(prev => ({ ...prev, [fieldName]: value }))

    // Track filled fields for the progress bar
    const fieldIndex = formFieldNames.indexOf(fieldName)
    if (fieldIndex !== -1) {
      setFilledFieldsMap(prev => ({ ...prev, [fieldIndex]: !!String(value).trim() }))
    }
  }

  // Clicking the same checkbox twice deselects it
  const toggleSingleSelectField = (fieldName, value) => {
    handleFieldChange(fieldName, form[fieldName] === value ? '' : value)
  }

  const resetForm = () => {
    setForm(emptyForm)
    setFilledFieldsMap({})
    setBrandFitSlider(12)
  }

  // ─────────────────────────────────────────────
  // FORM SUBMISSION + SCORING
  // ─────────────────────────────────────────────

  const handleSubmit = () => {
    // Shake the URL row if the required field is empty
    if (!form.instagramUrl.trim()) {
      gsap.fromTo(
        '#instagramRow',
        { x: -5 },
        { x: 0, duration: 0.5, ease: 'elastic.out(1,0.3)' }
      )
      return
    }

    gsap.to('#submitButton', { scale: 0.97, duration: 0.1, yoyo: true, repeat: 1 })
    setIsProcessing(true)
    setStampVisible(false)

    // Cycle through processing messages while the fake scrape runs
    let messageIndex = 0
    setProcessingMessage(processingMessages[0])

    const messageTicker = setInterval(() => {
      messageIndex++
      setProcessingMessage(processingMessages[messageIndex % processingMessages.length])
    }, 420)

    // After 2.6 seconds show the verdict
    setTimeout(() => {
      clearInterval(messageTicker)
      setIsProcessing(false)

      const engagementRate = parseFloat(form.avgEngagement) || 0
      const followerCount  = parseInt(form.followerCount)   || 0

      // Simple additive scoring
      let score = 50
      if (engagementRate >= 5)    score += 20
      if (engagementRate >= 8)    score += 15
      if (followerCount > 100000) score += 10
      if (form.objective)         score += 10
      if (form.niche)             score += 5

      const verdictText  = score >= 80 ? 'HIGH ROI POTENTIAL'
                         : score >= 60 ? 'MODERATE POTENTIAL'
                         : 'LOW CONFIDENCE'

      const verdictColor = score >= 80 ? '#3a6a3a'
                         : score >= 60 ? '#8a6000'
                         : '#ee684d'

      setVerdictResult({ text: verdictText, color: verdictColor, score })
      setTimeout(() => setStampVisible(true), 400)
    }, 2600)
  }

  // ─────────────────────────────────────────────
  // DERIVED VALUES — computed from state
  // ─────────────────────────────────────────────

  const engagementRate    = parseFloat(form.avgEngagement) || 0
  const followerCount     = parseInt(form.followerCount)   || 0
  const filledFieldsCount = Object.values(filledFieldsMap).filter(Boolean).length
  const selectedObjective = objectiveOptions.find(o => o.value === form.objective)?.label

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  return (
    <>
      {/* ── Processing overlay — covers full screen during fake scrape ── */}
      {isProcessing && (
        <div className="processing-overlay">
          <div className="processing-message">[ {processingMessage} ]</div>
          <div className="processing-bar-track">
            <div className="processing-bar-fill" />
          </div>
        </div>
      )}

      <div className="page-root">

        {/* ════════════════════════════════ TOOLBAR ════════════════════════════════ */}
        <div className="top-toolbar">
          <div className="toolbar-left-side">
            <div className="toolbar-button-group">
              <button className="toolbar-button">Explore</button>
              <button className="toolbar-button">○</button>
              <button className="toolbar-button">♥</button>
              <button className="toolbar-button">Tags</button>
              <button className="toolbar-button">Links</button>
            </div>
            <div className="toolbar-button-group">
              <button className="toolbar-button">⊖ Removed</button>
              <button className="toolbar-button">⚙ Filters</button>
              <button className="toolbar-button">↓</button>
            </div>
          </div>
          <div className="toolbar-right-side">
            <div className="toolbar-button-group">
              <button className="toolbar-button">Explore</button>
              <button className="toolbar-button">○</button>
              <button className="toolbar-button">♥</button>
              <button className="toolbar-button">Tags</button>
              <button className="toolbar-button">Links</button>
            </div>
            <div className="toolbar-button-group">
              <button className="toolbar-button">⊖ Removed</button>
              <button className="toolbar-button">⚙ Filters</button>
              <button className="toolbar-button">↓</button>
            </div>
            <button className="toolbar-explore-button">Explore</button>
          </div>
        </div>

        {/* ════════════════════════════════ THREE-COLUMN LAYOUT ════════════════════════════════ */}
        <div className="three-column-layout">

          {/* ════════════════ LEFT SIDEBAR — Nutrition Facts ════════════════ */}
          <div className="left-sidebar">
            <div className="nutrition-facts-panel">

              <div className="nutrition-header">
                <div className="nutrition-main-title">SPONSORSHIP<br />FACTS</div>
                <div className="nutrition-serving-size">Serving Size: 1 Creator Profile</div>
                <div className="nutrition-serving-size">Servings Per Campaign: 1</div>
              </div>

              <div className="divider divider--thick" />

              <div className="nutrition-score-block">
                <div className="nutrition-score-label">Amount Per Analysis</div>
                <div className="nutrition-score-row">
                  <span className="nutrition-score-word">ROI Score</span>
                  <span className="nutrition-score-number">
                    {verdictResult ? verdictResult.score : '—'}
                  </span>
                </div>
              </div>

              <div className="divider divider--medium" />
              <div className="divider divider--thin" />

              <div className="nutrition-daily-value-label">% Daily Value*</div>

              <div className="nutrition-data-row">
                <span>
                  <b>Total Reach</b>{' '}
                  {followerCount > 0 ? (followerCount / 1000).toFixed(0) + 'K' : '0'}
                </span>
                <span>
                  <b>{followerCount > 100000 ? '74%' : followerCount > 10000 ? '42%' : '0%'}</b>
                </span>
              </div>
              <div className="divider divider--thin" />

              <div className="nutrition-data-row nutrition-data-row--indent-1">
                <span>
                  Organic Reach{' '}
                  {followerCount > 0 ? Math.round(followerCount * 0.84 / 1000) + 'K' : '0'}
                </span>
                <span>84%</span>
              </div>
              <div className="divider divider--thin" />

              <div className="nutrition-data-row nutrition-data-row--indent-2">
                <span>
                  Paid Amplif.{' '}
                  {followerCount > 0 ? Math.round(followerCount * 0.16 / 1000) + 'K' : '0'}
                </span>
              </div>
              <div className="divider divider--thin" />

              <div className="nutrition-data-row">
                <span>
                  <b>Engagement Rate</b>{' '}
                  {form.avgEngagement ? form.avgEngagement + '%' : '0%'}
                </span>
                <span>
                  <b>{engagementRate >= 5 ? '88%' : engagementRate >= 2 ? '44%' : '0%'}</b>
                </span>
              </div>
              <div className="divider divider--thin" />

              <div className="nutrition-data-row nutrition-data-row--indent-1">
                <span>Story Interactions 3.2%</span>
                <span>28%</span>
              </div>
              <div className="divider divider--thin" />

              <div className="nutrition-data-row nutrition-data-row--indent-2">
                <span>Incl. {form.avgEngagement || '0'}% Sponsored Posts</span>
              </div>
              <div className="divider divider--thin" />

              <div className="nutrition-data-row">
                <span><b>Post Frequency</b> {form.postFrequency || 'N/A'}</span>
                <span><b>{form.postFrequency ? '60%' : '—'}</b></span>
              </div>
              <div className="divider divider--thin" />

              <div className="nutrition-data-row">
                <span><b>Brand Fit Score</b> {brandFitSlider}/20</span>
                <span><b>{Math.round((brandFitSlider / 20) * 100)}%</b></span>
              </div>
              <div className="divider divider--thin" />

              <div className="nutrition-data-row">
                <span><b>Niche Authority</b> {form.niche || '—'}</span>
                <span><b>{form.niche ? '55%' : '—'}</b></span>
              </div>

              <div className="divider divider--thick" style={{ marginTop: 4 }} />

              <div className="nutrition-mini-grid">
                <div className="nutrition-mini-cell">
                  <span>Niche Auth.</span>
                  <span>{form.niche ? '55%' : '0%'}</span>
                </div>
                <div className="nutrition-mini-cell nutrition-mini-cell--right-border">
                  <span>Brand Fit</span>
                  <span>{Math.round((brandFitSlider / 20) * 100)}%</span>
                </div>
                <div className="nutrition-mini-cell">
                  <span>ROI Proj.</span>
                  <span>
                    {verdictResult
                      ? verdictResult.score >= 80 ? '88%'
                        : verdictResult.score >= 60 ? '62%'
                        : '34%'
                      : '—'}
                  </span>
                </div>
                <div className="nutrition-mini-cell nutrition-mini-cell--right-border">
                  <span>Spons. Hist.</span>
                  <span>2%</span>
                </div>
              </div>

              <div className="divider divider--thin" />

              <div className="nutrition-footnote">
                * Percent Daily Values based on a 2,000-follower campaign budget.
                Your goals may be higher or lower.
              </div>

              {/* Verdict stamp — only appears after analysis */}
              {verdictResult && (
                <div
                  className="nutrition-verdict-stamp"
                  style={{ opacity: stampVisible ? 1 : 0, borderColor: verdictResult.color }}
                >
                  <div className="verdict-stamp-text" style={{ color: verdictResult.color }}>
                    {verdictResult.text}
                  </div>
                  <div className="verdict-stamp-subtext">CREATORIQ INTELLIGENCE RESULT</div>
                </div>
              )}

              <div className="scrolling-marquee">
                <div className="scrolling-marquee-track">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <span key={i} className="scrolling-marquee-item">
                      SPONSORSHIP FACTS <i className="marquee-square-dot" />
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* ════════════════ CENTER AREA ════════════════ */}
          <div className="center-area">

            {/* ── Follower Performance Chart ── */}
            <div className="chart-wrapper">
              <div className="chart-label-pill">[ PROJECTED SPONSORSHIP PERFORMANCE ]</div>
              <div className="chart-canvas-container">
                <canvas ref={followerChartRef} />
              </div>
            </div>

            {/* ── Top 10 Posts Swiper ── */}
            <div className="posts-section">

              {/* Header */}
              <div className="posts-section-header">
                <div className="posts-section-header-left">
                  <div className="posts-live-badge">
                    <i className="posts-live-dot" />
                    <span>LIVE SCRAPE</span>
                  </div>
                  <span className="posts-section-title">TOP 10 POSTS</span>
                  <span className="posts-count-badge">{mockScrapedPosts.length} FOUND</span>
                </div>
                <div className="posts-section-header-right">
                  {/* These IDs are used by Swiper's navigation prop below */}
                  <button className="swiper-nav-button" id="postsNavPrev">←</button>
                  <button className="swiper-nav-button" id="postsNavNext">→</button>
                </div>
              </div>

              {/* Swiper carousel */}
              <Swiper
                modules={[Navigation, Mousewheel]}
                spaceBetween={10}
                slidesPerView="auto"
                mousewheel={{ forceToAxis: true }}
                navigation={{
                  prevEl: '#postsNavPrev',
                  nextEl: '#postsNavNext',
                }}
                className="posts-swiper"
              >
                {mockScrapedPosts.map((post) => {
                  const isExpanded = expandedPostId === post.id
                  const typeStyle  = postTypeColors[post.postType]

                  return (
                    <SwiperSlide key={post.id} className="post-slide">
                      <div className={`post-card ${isExpanded ? 'post-card--expanded' : ''}`}>

                        {/* Gradient image placeholder */}
                        <div
                          className="post-card-image"
                          style={{
                            background: `linear-gradient(135deg, ${post.gradientFrom} 0%, ${post.gradientTo} 100%)`,
                          }}
                        >
                          {/* Rank — top left */}
                          <div className="post-rank-badge">#{post.rank}</div>

                          {/* Post type — top right */}
                          <div
                            className="post-type-badge"
                            style={{ background: typeStyle.bg, color: typeStyle.text }}
                          >
                            {post.postType}
                          </div>

                          {/* Sponsored label — bottom left, only if sponsored */}
                          {post.isSponsored && (
                            <div className="post-sponsored-badge">◆ {post.brand}</div>
                          )}

                          {/* Instagram icon watermark in center */}
                          <div className="post-image-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                              <circle cx="12" cy="12" r="4" />
                              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                            </svg>
                          </div>
                        </div>

                        {/* Card body */}
                        <div className="post-card-body">
                          <div className="post-username">{post.username}</div>

                          <div className="post-stats-row">
                            <div className="post-stat">
                              <span className="post-stat-icon">♥</span>
                              <span className="post-stat-value">{post.likes}</span>
                            </div>
                            <div className="post-stat">
                              <span className="post-stat-icon">◎</span>
                              <span className="post-stat-value">{post.comments}</span>
                            </div>
                            <div className="post-engagement-rate">{post.engagementRate}</div>
                          </div>

                          {/* Caption — clamped unless expanded */}
                          <div className={`post-caption ${isExpanded ? 'post-caption--expanded' : ''}`}>
                            {post.caption}
                          </div>

                          <div className="post-card-footer">
                            <span className="post-time">{post.postedAt}</span>
                            <button
                              className="post-expand-button"
                              onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                            >
                              {isExpanded ? '[ LESS ]' : '[ MORE ]'}
                            </button>
                          </div>
                        </div>

                      </div>
                    </SwiperSlide>
                  )
                })}
              </Swiper>

            </div>

            {/* ── Engagement Rate Chart ── */}
            <div className="chart-wrapper">
              <div className="chart-watermark">SocialBlade.com</div>
              <div className="chart-label-pill">[ ENGAGEMENT RATE ]</div>
              <div className="chart-canvas-container">
                <canvas ref={engagementChartRef} />
              </div>
            </div>

          </div>

          {/* ════════════════ RIGHT SIDEBAR — Analysis Form ════════════════ */}
          <div className="right-sidebar">
            <div className="analysis-panel">

              <div className="panel-top-row">
                <span className="panel-logo">CREATOR·IQ</span>
                <button className="panel-icon-button">[≡]</button>
                <button className="panel-icon-button panel-icon-button--right">[○]</button>
              </div>

              <div className="panel-hero">
                <div className="panel-hero-top-row">
                  <h1 className="panel-hero-title">analyze</h1>
                  <svg className="panel-hero-arrow" viewBox="0 0 32 36">
                    <path d="M3 4 H17 V32" />
                    <path d="M6 22 L17 33 L28 22" />
                  </svg>
                </div>
                <div className="panel-hero-subtitle">
                  <div className="panel-hero-subtitle-row">
                    <span>SPONSORSHIP</span>
                    <span>BRAND FIT</span>
                  </div>
                  <div className="panel-hero-subtitle-row">
                    <span>&amp;</span>
                    <span>INTELLIGENCE</span>
                    <span>CREATORS</span>
                  </div>
                </div>
              </div>

              <div className="section-heading-row">
                <span className="section-heading-text">[ CREATOR(S) ]</span>
                <button className="reset-icon-button" onClick={resetForm}>⇅</button>
              </div>

              <div className="dotted-divider" />

              {/* Active filter pills */}
              <div className="active-filters-row">
                <span className="active-filters-label">FIELDS [+]</span>

                {form.niche && (
                  <button className="active-filter-pill" onClick={() => handleFieldChange('niche', '')}>
                    {form.niche}
                    <span className="filter-pill-remove">×</span>
                  </button>
                )}

                {selectedObjective && (
                  <button className="active-filter-pill" onClick={() => handleFieldChange('objective', '')}>
                    {selectedObjective.split(' ')[0]}
                    <span className="filter-pill-remove">×</span>
                  </button>
                )}

                <span className="fields-filled-count">
                  [{filledFieldsCount} / {formFieldNames.length}]
                </span>
              </div>

              <div className="dotted-divider" />

              {/* Goal + Niche two-column filter area */}
              <div className="two-column-filters">

                <div className="filter-column">
                  <div className="filter-column-header">
                    <span>[GOAL]</span>
                    <button className="filter-reset-button" onClick={() => handleFieldChange('objective', '')}>
                      RESET
                    </button>
                  </div>
                  {objectiveOptions.map(option => (
                    <label key={option.value} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={form.objective === option.value}
                        onChange={() => toggleSingleSelectField('objective', option.value)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${(filledFieldsCount / formFieldNames.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="filter-column">
                  <div className="filter-column-header">
                    <span>[NICHE]</span>
                    <button className="filter-reset-button" onClick={() => handleFieldChange('niche', '')}>
                      RESET
                    </button>
                  </div>
                  <div className="niche-scroll-area">
                    {nicheOptions.map(niche => (
                      <label key={niche} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={form.niche === niche}
                          onChange={() => toggleSingleSelectField('niche', niche)}
                        />
                        <span>{niche}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>

              <div className="scrolling-marquee scrolling-marquee--panel">
                <div className="scrolling-marquee-track">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <span key={i} className="scrolling-marquee-item">
                      CREATORIQ WORKS <i className="marquee-square-dot" />
                    </span>
                  ))}
                </div>
              </div>

              {/* Input fields */}
              <div className="form-fields-list">

                <div className="form-field-row" id="instagramRow">
                  <span className="field-number">0007</span>
                  <span className={`field-icon ${form.instagramUrl ? 'field-icon--filled' : ''}`}>@</span>
                  <input
                    id="instagramUrl"
                    type="url"
                    className="field-input"
                    placeholder="Instagram URL"
                    value={form.instagramUrl}
                    onChange={e => handleFieldChange('instagramUrl', e.target.value)}
                  />
                  <span className="field-tags">
                    <span className="field-tag">REQUIRED</span>
                    <span className="field-tag">URL</span>
                  </span>
                </div>

                <div className="form-field-row">
                  <span className="field-number">0006</span>
                  <span className={`field-icon ${form.brandName ? 'field-icon--filled' : ''}`}>B</span>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="Brand Name"
                    value={form.brandName}
                    onChange={e => handleFieldChange('brandName', e.target.value)}
                  />
                  <span className="field-tags">
                    <span className="field-tag">BRAND</span>
                  </span>
                </div>

                <div className="form-field-row">
                  <span className="field-number">0005</span>
                  <span className={`field-icon ${form.followerCount ? 'field-icon--filled' : ''}`}>#</span>
                  <input
                    type="number"
                    className="field-input"
                    placeholder="Followers"
                    value={form.followerCount}
                    onChange={e => handleFieldChange('followerCount', e.target.value)}
                  />
                  <span className="field-tags">
                    <span className="field-tag">REACH</span>
                  </span>
                </div>

                <div className="form-field-row">
                  <span className="field-number">0004</span>
                  <span className={`field-icon ${form.avgEngagement ? 'field-icon--filled' : ''}`}>%</span>
                  <input
                    type="number"
                    step="0.1"
                    className="field-input"
                    placeholder="Avg Engagement %"
                    value={form.avgEngagement}
                    onChange={e => handleFieldChange('avgEngagement', e.target.value)}
                  />
                  <span className="field-tags">
                    <span className="field-tag">METRIC</span>
                    <span className="field-tag">%</span>
                  </span>
                </div>

                <div className="form-field-row">
                  <span className="field-number">0003</span>
                  <span className={`field-icon ${form.postFrequency ? 'field-icon--filled' : ''}`}>↻</span>
                  <select
                    className="field-input field-input--select"
                    value={form.postFrequency}
                    onChange={e => handleFieldChange('postFrequency', e.target.value)}
                  >
                    <option value="">Post Frequency</option>
                    <option>DAILY</option>
                    <option>3-5X / WEEK</option>
                    <option>1-2X / WEEK</option>
                    <option>FEW / MONTH</option>
                    <option>IRREGULAR</option>
                  </select>
                  <span className="field-tags">
                    <span className="field-tag">CADENCE</span>
                  </span>
                </div>

                <div className="form-field-row">
                  <span className="field-number">0002</span>
                  <span className="field-icon field-icon--filled">◐</span>
                  <input
                    type="range"
                    className="field-slider"
                    min="1"
                    max="20"
                    value={brandFitSlider}
                    onChange={e => setBrandFitSlider(parseInt(e.target.value))}
                  />
                  <span className="field-tags">
                    <span className="field-tag">CONFIDENCE</span>
                    <span className="field-tag">{brandFitSlider}/20</span>
                  </span>
                </div>

                <div className="form-field-row">
                  <span className="field-number">0001</span>
                  <span className={`field-icon ${form.examinerNotes ? 'field-icon--filled' : ''}`}>✎</span>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="Analyst Notes"
                    value={form.examinerNotes}
                    onChange={e => handleFieldChange('examinerNotes', e.target.value)}
                  />
                  <span className="field-tags">
                    <span className="field-tag">NOTES</span>
                  </span>
                </div>

              </div>

              <button className="submit-button" id="submitButton" onClick={handleSubmit}>
                <span>[ RUN ANALYSIS ]</span>
                <span>↘</span>
              </button>

              <div className="submit-disclaimer">
                SCRAPING LAST 50 POSTS · REPORT IN 30–60S<br />
                ENGINE 94-B · NO FAKE METRICS · RAW DATA ONLY
              </div>

              <div className="panel-footer">
                <span className="panel-footer-status">
                  <i className="live-status-dot" /> [ONLINE]
                </span>
                <span>[{clockDisplay}]</span>
              </div>

            </div>
          </div>

        </div>
      </div>

      <img src="https://scontent-del2-2.cdninstagram.com/v/t51.82787-15/829528164_18114217847098306_3171092026193588546_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=105&ig_cache_key=Mzk5NjQwOTg5NTk5NTI1ODU3MQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTA4MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=Krod24Uj12YQ7kNvwEcaMJI&_nc_oc=AdoCjo4PjhdLRp8nGxcJRibA36R5gRD74M7q--1NvYRnZ_KnG-GgDhLPQmXp5vOu1tU&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-del2-2.cdninstagram.com&_nc_gid=4tuhqZvgwk22xExob5Y9gw&_nc_ss=7a22e&oh=00_AQM7Z0hgZUqjMn6Hi2LbgWKIAx-BVsWc6gnyCjclzxDGQg&oe=6AC1EBF0" />

      {/* ════════════════════════════════ ALL STYLES ════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        /* ── Design tokens — change these to retheme the whole app ── */
        :root {
          --blue:              #92b2dc;
          --blue-dark:         #6a90bf;
          --blue-faint:        rgba(146,178,220,0.16);
          --orange:            #ee684d;
          --orange-dark:       #c94e35;
          --orange-faint:      rgba(238,104,77,0.18);
          --cream:             #f0e9b5;
          --ink:               #2c2416;
          --ink-light:         #5a5040;
          --bg:                #edeae0;
          --bg-light:          #f5f2e8;

          --border-solid:         1px solid rgba(146,178,220,0.45);
          --border-dashed:        1px dashed rgba(146,178,220,0.55);
          --border-dotted:        2px dotted rgba(146,178,220,0.45);
          --border-thick:         2px solid rgba(146,178,220,0.55);
          --border-orange-dashed: 1px dashed rgba(238,104,77,0.45);

          /* ── Font scale — change these 6 values to resize all text ── */
          --font-xs:   11px;
          --font-sm:   13px;
          --font-base: 15px;
          --font-md:   17px;
          --font-lg:   20px;
          --font-xl:   24px;
        }

        html, body {
          height: 100%;
          font-family: 'Inter', sans-serif;
          font-size: var(--font-base);
          background: var(--bg);
          color: var(--ink);
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* ══════════════════════════════
           PROCESSING OVERLAY
        ══════════════════════════════ */
        .processing-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(240,233,181,0.96);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 20px;
        }
        .processing-message {
          font-family: 'Space Mono', monospace;
          font-size: var(--font-md);
          color: var(--ink);
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }
        .processing-bar-track {
          width: 280px;
          height: 8px;
          border: var(--border-solid);
          overflow: hidden;
        }
        .processing-bar-fill {
          height: 100%;
          background: var(--blue);
          animation: fillBar 2.5s ease-out forwards;
        }
        @keyframes fillBar {
          0%   { width: 0;    }
          30%  { width: 40%;  }
          60%  { width: 68%;  }
          80%  { width: 84%;  }
          100% { width: 100%; }
        }

        /* ══════════════════════════════
           PAGE ROOT
        ══════════════════════════════ */
        .page-root {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          flex-direction: column;
        }

        /* ══════════════════════════════
           TOP TOOLBAR
        ══════════════════════════════ */
        .top-toolbar {
          border-bottom: var(--border-dotted);
          padding: 8px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-shrink: 0;
        }
        .toolbar-left-side,
        .toolbar-right-side {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .toolbar-button-group {
          display: flex;
          align-items: center;
          gap: 2px;
          border: var(--border-dashed);
          padding: 3px 7px;
        }
        .toolbar-button {
          background: none;
          border: none;
          padding: 3px 9px;
          font-size: var(--font-sm);
          color: var(--ink);
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          transition: color 0.15s;
        }
        .toolbar-button:hover { color: var(--blue-dark); }
        .toolbar-explore-button {
          background: var(--blue);
          color: #fff;
          border: none;
          padding: 7px 20px;
          font-size: var(--font-sm);
          font-weight: 700;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          letter-spacing: 1px;
          transition: background 0.15s;
        }
        .toolbar-explore-button:hover { background: var(--blue-dark); }

        /* ══════════════════════════════
           THREE-COLUMN LAYOUT
        ══════════════════════════════ */
        .three-column-layout {
          display: flex;
          height: calc(100vh - 50px);
          overflow: hidden;
        }

        /* ══════════════════════════════
           LEFT SIDEBAR — Nutrition Facts
        ══════════════════════════════ */
        .left-sidebar {
          width: 25%;
          background: var(--cream);
          border-right: var(--border-dotted);
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: var(--blue) transparent;
        }
        .left-sidebar::-webkit-scrollbar       { width: 4px; }
        .left-sidebar::-webkit-scrollbar-thumb { background: var(--blue); }

        .nutrition-facts-panel { color: var(--ink); }

        .nutrition-header {
          padding: 14px 14px 10px;
          background: var(--cream);
          border-bottom: 3px solid var(--ink);
        }
        .nutrition-main-title {
          font-family: 'Inter', sans-serif;
          font-weight: 900;
          font-size: 30px;
          line-height: 0.95;
          color: var(--ink);
          text-transform: uppercase;
          letter-spacing: -0.5px;
          margin-bottom: 8px;
        }
        .nutrition-serving-size {
          font-size: var(--font-xs);
          font-weight: 500;
          color: var(--ink-light);
          line-height: 1.7;
        }

        /* Dividers */
        .divider         { margin: 0; }
        .divider--thick  { height: 10px; background: var(--blue); }
        .divider--medium { height: 4px;  background: var(--orange); }
        .divider--thin   { height: 1px;  background: rgba(44,36,22,0.2); }

        .nutrition-score-block { padding: 6px 14px 0; background: var(--cream); }
        .nutrition-score-label { font-size: var(--font-sm); font-weight: 700; color: var(--ink); }
        .nutrition-score-row   { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 4px; }
        .nutrition-score-word  { font-size: var(--font-md); font-weight: 800; color: var(--ink); }
        .nutrition-score-number {
          font-size: 42px;
          font-weight: 900;
          color: var(--blue-dark);
          line-height: 1;
        }
        .nutrition-daily-value-label {
          text-align: right;
          font-size: var(--font-xs);
          font-weight: 700;
          padding: 3px 14px;
          border-bottom: var(--border-solid);
          background: var(--cream);
          color: var(--ink-light);
        }
        .nutrition-data-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding: 5px 14px;
          font-size: var(--font-sm);
          font-weight: 500;
          color: var(--ink);
          line-height: 1.5;
          background: var(--cream);
        }
        .nutrition-data-row b            { font-weight: 700; }
        .nutrition-data-row--indent-1    { padding-left: 26px; }
        .nutrition-data-row--indent-2    { padding-left: 38px; font-size: var(--font-xs); color: var(--ink-light); }

        .nutrition-mini-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: var(--orange-faint);
        }
        .nutrition-mini-cell {
          display: flex;
          justify-content: space-between;
          padding: 6px 14px;
          font-size: var(--font-xs);
          font-weight: 600;
          color: var(--ink);
          border-bottom: var(--border-dashed);
        }
        .nutrition-mini-cell--right-border { border-left: var(--border-dashed); }

        .nutrition-footnote {
          padding: 8px 14px;
          font-size: var(--font-xs);
          font-weight: 500;
          color: var(--ink-light);
          line-height: 1.6;
          background: var(--cream);
        }
        .nutrition-verdict-stamp {
          margin: 12px 14px;
          padding: 10px 12px;
          border: var(--border-thick);
          text-align: center;
          transform: rotate(-3deg);
          transition: opacity 0.5s;
          background: rgba(240,233,181,0.6);
        }
        .verdict-stamp-text {
          font-size: var(--font-md);
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .verdict-stamp-subtext {
          font-size: var(--font-xs);
          font-weight: 600;
          color: var(--ink-light);
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-top: 4px;
        }

        /* ══════════════════════════════
           SHARED SCROLLING MARQUEE
        ══════════════════════════════ */
        .scrolling-marquee {
          border-top: var(--border-dotted);
          overflow: hidden;
          white-space: nowrap;
          padding: 8px 0;
        }
        .scrolling-marquee--panel {
          margin: 0 -14px;
          border-top: var(--border-dotted);
          border-bottom: var(--border-dotted);
          background: var(--cream);
          padding: 10px 0;
        }
        .scrolling-marquee-track {
          display: inline-flex;
          animation: marqueeScroll 16s linear infinite;
        }
        .scrolling-marquee-item {
          display: inline-flex;
          align-items: center;
          gap: 18px;
          padding-right: 18px;
          font-family: 'Inter', sans-serif;
          font-size: var(--font-sm);
          font-weight: 700;
          color: var(--ink);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .marquee-square-dot {
          display: inline-block;
          width: 9px;
          height: 9px;
          background: var(--blue);
        }
        @keyframes marqueeScroll {
          from { transform: translateX(0);    }
          to   { transform: translateX(-50%); }
        }

        /* ══════════════════════════════
           CENTER AREA
        ══════════════════════════════ */
        .center-area {
          width: 50%;
          background: #faf8ee;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border-left: var(--border-dotted);
          border-right: var(--border-dotted);
        }

        /* ── Chart wrapper ──
           Fixed height so charts stay compact and don't stretch.
           Change 160px here to resize both charts at once.        */
        .chart-wrapper {
          height: 160px;
          position: relative;
          border-bottom: var(--border-dotted);
          flex-shrink: 0;
        }

        /* Canvas fills the full wrapper — padding is handled inside Chart.js
           via layout.padding so the line stays away from all 4 edges         */
        .chart-canvas-container {
          position: absolute;
          inset: 0;
        }
        .chart-canvas-container canvas {
          width: 100% !important;
          height: 100% !important;
          display: block;
        }

        /* Label pill overlays the chart in the top-right corner */
        .chart-label-pill {
          position: absolute;
          top: 8px;
          right: 10px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: var(--font-xs);
          color: var(--ink-light);
          border: var(--border-dashed);
          padding: 3px 9px;
          letter-spacing: 0.5px;
          background: var(--cream);
          z-index: 2;
          pointer-events: none;
        }

        /* Faint watermark centered in the engagement chart */
        .chart-watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 20px;
          color: rgba(238,104,77,0.08);
          font-style: italic;
          pointer-events: none;
          z-index: 1;
          white-space: nowrap;
        }

        /* ══════════════════════════════
           TOP 10 POSTS SECTION
        ══════════════════════════════ */
        .posts-section {
          /* flex: 1 lets this section fill all remaining height
             between the two charts                              */
          flex: 1;
          min-height: 0;
          border-bottom: var(--border-dotted);
          background: #faf8ee;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .posts-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 14px 6px;
          border-bottom: var(--border-dashed);
          flex-shrink: 0;
        }
        .posts-section-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .posts-section-header-right {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* "LIVE SCRAPE" pill */
        .posts-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: var(--orange-faint);
          border: var(--border-orange-dashed);
          padding: 2px 8px;
          font-size: var(--font-xs);
          font-weight: 700;
          color: var(--orange-dark);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .posts-live-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          background: var(--orange);
          border-radius: 50%;
          animation: pulse 1.8s ease-in-out infinite;
        }

        .posts-section-title {
          font-size: var(--font-sm);
          font-weight: 800;
          color: var(--ink);
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .posts-count-badge {
          font-family: 'Space Mono', monospace;
          font-size: var(--font-xs);
          font-weight: 700;
          color: var(--blue-dark);
          border: var(--border-solid);
          padding: 1px 7px;
          letter-spacing: 0.3px;
        }

        /* Custom prev/next buttons */
        .swiper-nav-button {
          width: 28px;
          height: 28px;
          border: var(--border-dashed);
          background: transparent;
          color: var(--ink);
          font-size: var(--font-md);
          font-weight: 700;
          cursor: pointer;
          display: grid;
          place-items: center;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
          font-family: 'Inter', sans-serif;
          line-height: 1;
        }
        .swiper-nav-button:hover {
          background: var(--blue);
          color: #fff;
          border-color: var(--blue);
        }
        .swiper-nav-button:disabled { opacity: 0.3; cursor: not-allowed; }

        /* Swiper fills the remaining height after the header */
        .posts-swiper {
          width: 100%;
          flex: 1;
          min-height: 0;
          padding: 10px 14px !important;
          overflow: visible !important;
        }

        /* Each slide is exactly as wide as the card */
        .post-slide {
          width: 160px !important;
          height: auto;
        }

        /* ── Post card ── */
        .post-card {
          width: 160px;
          border: var(--border-dashed);
          background: var(--bg-light);
          display: flex;
          flex-direction: column;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .post-card:hover {
          border-color: var(--blue);
          box-shadow: 0 2px 12px rgba(146,178,220,0.2);
        }
        .post-card--expanded {
          border-color: var(--blue);
          border-left: 3px solid var(--blue);
        }

        /* Gradient image area */
        .post-card-image {
          position: relative;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-bottom: var(--border-dashed);
          overflow: hidden;
        }

        /* Rank badge — top left */
        .post-rank-badge {
          position: absolute;
          top: 6px;
          left: 6px;
          font-family: 'Space Mono', monospace;
          font-size: var(--font-xs);
          font-weight: 700;
          color: var(--ink);
          background: rgba(240,233,181,0.92);
          padding: 1px 5px;
          letter-spacing: 0.5px;
          border: 1px solid rgba(44,36,22,0.15);
        }

        /* Post type badge — top right */
        .post-type-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          font-family: 'Inter', sans-serif;
          font-size: 9px;
          font-weight: 800;
          padding: 2px 5px;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        /* Sponsored badge — bottom left */
        .post-sponsored-badge {
          position: absolute;
          bottom: 6px;
          left: 6px;
          font-family: 'Inter', sans-serif;
          font-size: 9px;
          font-weight: 700;
          color: var(--ink);
          background: rgba(240,233,181,0.92);
          padding: 1px 5px;
          letter-spacing: 0.5px;
          border: 1px solid rgba(44,36,22,0.15);
          text-transform: uppercase;
        }

        /* Instagram icon watermark */
        .post-image-icon {
          width: 36px;
          height: 36px;
          color: rgba(44,36,22,0.25);
        }
        .post-image-icon svg { width: 100%; height: 100%; }

        /* Card body */
        .post-card-body {
          padding: 8px 9px 7px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          flex: 1;
        }

        .post-username {
          font-family: 'Space Mono', monospace;
          font-size: var(--font-xs);
          font-weight: 700;
          color: var(--blue-dark);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .post-stats-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .post-stat {
          display: flex;
          align-items: center;
          gap: 3px;
        }
        .post-stat-icon  { font-size: 10px; color: var(--ink-light); }
        .post-stat-value { font-size: var(--font-xs); font-weight: 700; color: var(--ink); }

        /* Engagement rate — highlighted pill */
        .post-engagement-rate {
          margin-left: auto;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          color: #fff;
          background: var(--blue-dark);
          padding: 1px 5px;
          letter-spacing: 0.3px;
        }

        /* Caption — 2-line clamp by default */
        .post-caption {
          font-size: var(--font-xs);
          font-weight: 400;
          color: var(--ink-light);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        /* Full caption when expanded */
        .post-caption--expanded {
          display: block;
          -webkit-line-clamp: unset;
          overflow: visible;
        }

        .post-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 4px;
          border-top: var(--border-dashed);
        }
        .post-time {
          font-size: 10px;
          font-weight: 500;
          color: var(--ink-light);
        }
        .post-expand-button {
          background: none;
          border: none;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          color: var(--blue-dark);
          cursor: pointer;
          padding: 0;
          letter-spacing: 0.3px;
          transition: color 0.15s;
        }
        .post-expand-button:hover { color: var(--orange); }

        /* ══════════════════════════════
           RIGHT SIDEBAR — Analysis Panel
        ══════════════════════════════ */
        .right-sidebar {
          width: 25%;
          background: var(--bg);
          overflow-y: auto;
          overflow-x: hidden;
          border-left: var(--border-dotted);
          scrollbar-width: thin;
          scrollbar-color: var(--blue) transparent;
        }
        .right-sidebar::-webkit-scrollbar       { width: 4px; }
        .right-sidebar::-webkit-scrollbar-thumb { background: var(--blue); }

        .analysis-panel {
          min-height: 100%;
          display: flex;
          flex-direction: column;
          padding: 14px 16px 0;
          color: var(--ink);
        }

        .panel-top-row {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
        }
        .panel-logo {
          font-family: 'Inter', sans-serif;
          font-weight: 800;
          font-size: var(--font-sm);
          letter-spacing: 0.3px;
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-thickness: 1.5px;
          text-decoration-color: var(--blue);
          color: var(--ink);
        }
        .panel-icon-button {
          background: none;
          border: none;
          font-family: 'Inter', sans-serif;
          font-size: var(--font-sm);
          color: var(--ink-light);
          cursor: pointer;
          font-weight: 600;
          padding: 2px 4px;
        }
        .panel-icon-button:hover      { color: var(--blue-dark); }
        .panel-icon-button--right     { justify-self: end; }

        .panel-hero { padding: 30px 0 18px; }
        .panel-hero-top-row { display: flex; align-items: flex-end; justify-content: space-between; }
        .panel-hero-title {
          font-family: 'Inter', sans-serif;
          font-weight: 900;
          font-size: 52px;
          letter-spacing: -2.8px;
          line-height: 0.9;
          color: var(--ink);
        }
        .panel-hero-arrow {
          width: 30px;
          height: 34px;
          fill: none;
          stroke: var(--blue);
          stroke-width: 2.8;
          stroke-linecap: square;
          margin-bottom: 4px;
        }
        .panel-hero-subtitle {
          margin-top: 14px;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: var(--font-md);
          text-transform: uppercase;
          line-height: 1.4;
          color: var(--ink-light);
        }
        .panel-hero-subtitle-row { display: flex; justify-content: space-between; }

        .section-heading-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 16px 0 10px;
        }
        .section-heading-text { font-size: var(--font-sm); font-weight: 700; letter-spacing: 0.4px; color: var(--ink); }

        .reset-icon-button {
          width: 24px;
          height: 22px;
          border: var(--border-solid);
          background: transparent;
          font-size: var(--font-sm);
          color: var(--ink-light);
          cursor: pointer;
          display: grid;
          place-items: center;
          transition: border-color 0.15s, color 0.15s;
        }
        .reset-icon-button:hover { border-color: var(--blue); color: var(--blue); }

        .dotted-divider { border-top: var(--border-dotted); }

        .active-filters-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
          padding: 8px 0;
          font-size: var(--font-sm);
        }
        .active-filters-label { font-weight: 700; letter-spacing: 0.5px; color: var(--ink); margin-right: 2px; }

        .active-filter-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: var(--blue);
          color: #fff;
          border: none;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: var(--font-xs);
          letter-spacing: 0.5px;
          text-transform: uppercase;
          padding: 3px 8px;
          cursor: pointer;
          line-height: 1.5;
          transition: background 0.15s;
        }
        .active-filter-pill:hover { background: var(--blue-dark); }
        .filter-pill-remove {
          width: 11px;
          height: 11px;
          border: 1px solid rgba(255,255,255,0.7);
          display: grid;
          place-items: center;
          font-size: 9px;
        }
        .fields-filled-count { margin-left: auto; font-size: var(--font-xs); font-weight: 600; color: var(--ink-light); }

        .two-column-filters {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding: 10px 0 16px;
        }
        .filter-column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
          font-size: var(--font-sm);
          font-weight: 700;
          letter-spacing: 0.3px;
          color: var(--ink);
        }
        .filter-reset-button {
          border: var(--border-solid);
          background: transparent;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: var(--font-xs);
          letter-spacing: 0.3px;
          padding: 1px 6px;
          color: var(--ink-light);
          cursor: pointer;
          line-height: 1.6;
          transition: border-color 0.15s, color 0.15s;
        }
        .filter-reset-button:hover { border-color: var(--blue); color: var(--blue); }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: var(--font-sm);
          font-weight: 500;
          line-height: 2;
          letter-spacing: 0.2px;
          text-transform: uppercase;
          white-space: nowrap;
          cursor: pointer;
          color: var(--ink);
        }
        .checkbox-label input {
          appearance: none;
          -webkit-appearance: none;
          width: 13px;
          height: 13px;
          border: var(--border-solid);
          border-radius: 2px;
          flex-shrink: 0;
          background: transparent;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .checkbox-label input:checked { background: var(--blue); border-color: var(--blue); }

        .niche-scroll-area {
          max-height: 120px;
          overflow-y: auto;
          padding-right: 4px;
          scrollbar-width: thin;
          scrollbar-color: var(--blue) transparent;
        }
        .niche-scroll-area::-webkit-scrollbar       { width: 4px; }
        .niche-scroll-area::-webkit-scrollbar-thumb { background: var(--blue); border-radius: 2px; }

        .progress-bar-track { margin-top: 14px; height: 8px; border: var(--border-solid); overflow: hidden; }
        .progress-bar-fill  {
          height: 100%;
          background: repeating-linear-gradient(90deg, var(--blue) 0 2px, transparent 2px 4px);
          transition: width 0.4s ease;
        }

        /* ── Form field rows ── */
        .form-fields-list { margin-top: 8px; }
        .form-field-row {
          display: grid;
          grid-template-columns: 44px 20px minmax(0,1fr) auto;
          gap: 8px;
          align-items: center;
          padding: 9px 0;
          border-bottom: var(--border-orange-dashed);
        }
        .field-number {
          font-size: var(--font-sm);
          font-weight: 600;
          letter-spacing: 0.3px;
          color: var(--ink-light);
          transition: color 0.2s;
          font-family: 'Space Mono', monospace;
        }
        .form-field-row:focus-within .field-number { color: var(--blue); }

        .field-icon {
          width: 18px;
          height: 18px;
          display: grid;
          place-items: center;
          font-size: 10px;
          line-height: 1;
          color: #fff;
          background: var(--orange);
          opacity: 0.6;
          transition: opacity 0.2s, background 0.2s;
          font-weight: 700;
        }
        .field-icon--filled { opacity: 1; background: var(--blue); }

        .field-input {
          width: 100%;
          min-width: 0;
          background: transparent;
          border: none;
          outline: none;
          padding: 0;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: var(--font-sm);
          color: var(--ink);
        }
        .field-input::placeholder       { color: var(--ink-light); }
        .field-input:focus::placeholder { opacity: 0.5; }
        .field-input[type=number]::-webkit-inner-spin-button,
        .field-input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        .field-input[type=number] { -moz-appearance: textfield; }
        .field-input--select { appearance: none; -webkit-appearance: none; cursor: pointer; }
        .field-input--select option { background: var(--bg); color: var(--ink); }

        .field-tags { display: flex; gap: 3px; }
        .field-tag {
          font-family: 'Inter', sans-serif;
          font-size: var(--font-xs);
          font-weight: 700;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          color: var(--blue-dark);
          border: var(--border-dashed);
          padding: 2px 5px;
          line-height: 1.4;
          white-space: nowrap;
        }

        .field-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          min-width: 0;
          height: 16px;
          background: transparent;
          cursor: pointer;
        }
        .field-slider::-webkit-slider-runnable-track {
          height: 3px;
          background: repeating-linear-gradient(90deg, var(--blue) 0 2px, transparent 2px 5px);
        }
        .field-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          margin-top: -5.5px;
          background: var(--blue);
          border-radius: 2px;
          border: none;
        }
        .field-slider::-moz-range-track {
          height: 3px;
          background: repeating-linear-gradient(90deg, var(--blue) 0 2px, transparent 2px 5px);
        }
        .field-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background: var(--blue);
          border-radius: 2px;
          border: none;
        }

        /* ── Submit button ── */
        .submit-button {
          margin: 16px 0 10px;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--blue);
          color: #fff;
          border: none;
          padding: 13px 14px;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: var(--font-md);
          letter-spacing: 1.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.15s;
        }
        .submit-button:hover  { background: var(--blue-dark); }
        .submit-button:active { transform: scale(0.99); }

        .submit-disclaimer {
          font-size: var(--font-xs);
          font-weight: 500;
          color: var(--ink-light);
          letter-spacing: 0.3px;
          line-height: 1.8;
          text-transform: uppercase;
        }

        /* ── Panel footer with clock ── */
        .panel-footer {
          margin-top: 14px;
          padding: 10px 0 12px;
          border-top: var(--border-dotted);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: var(--font-sm);
          font-weight: 600;
          letter-spacing: 0.3px;
          color: var(--ink-light);
        }
        .panel-footer-status { display: inline-flex; align-items: center; gap: 7px; }
        .live-status-dot {
          display: inline-block;
          width: 9px;
          height: 9px;
          background: var(--blue);
          border-radius: 50%;
          animation: pulse 1.8s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(146,178,220,0.5); }
          50%       { opacity: 0.7; box-shadow: 0 0 0 5px rgba(146,178,220,0); }
        }

        /* ══════════════════════════════
           RESPONSIVE — below 900px
        ══════════════════════════════ */
        @media (max-width: 900px) {
          .three-column-layout { flex-direction: column; height: auto; }
          .left-sidebar        { display: none; }
          .center-area         { width: 100%; }
          .right-sidebar       { width: 100%; }
          .posts-section       { height: auto; min-height: 260px; }
        }
      `}</style>
    </>
  )
}