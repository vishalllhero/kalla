import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type Step = 'upload' | 'enhance' | 'describe' | 'catalog' | 'price' | 'publish'

type AIStudioState = {
  current: Step
  steps: Step[]
  artworkImage: File | null
  enhancedImageUrl: string | null
  originalImageUrl: string | null
  craft: string
  region: string
  description: string
  language: string
  priceSuggestion: number | null
  status: 'idle' | 'uploading' | 'enhancing' | 'processing' | 'ready' | 'publishing'
  error: string | null
  progress: number
}

export default function AIStudio() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [state, setState] = useState<AIStudioState>({
    current: 'upload',
    steps: ['upload', 'enhance', 'describe', 'catalog', 'price', 'publish'],
    artworkImage: null,
    enhancedImageUrl: null,
    originalImageUrl: null,
    craft: '',
    region: '',
    description: '',
    language: 'en',
    priceSuggestion: null,
    status: 'idle',
    error: null,
    progress: 0,
  })

  useEffect(() => {
    if (!user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  useEffect(() => {
    if (user?.role === 'artisan' || user?.role === 'admin') {
      // Artisan can access
    } else if (user) {
      setState(prev => ({
        ...prev,
        status: 'idle',
        error: 'Access denied. Only artisans and admins can access the AI Studio.',
      }))
    }
  }, [user])

  useEffect(() => {
    if (user?.profile?.region) {
      setState(prev => ({ ...prev, region: user.profile.region }))
    }
  }, [user])

  const setError = (error: string) => {
    setState(prev => ({ ...prev, error }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setState(prev => ({
        ...prev,
        artworkImage: file,
        originalImageUrl: result,
        enhancedImageUrl: null,
        status: 'uploading',
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleEnhanceImage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!state.artworkImage) {
      setError('Please upload an image first')
      return
    }

    setState(prev => ({ ...prev, status: 'enhancing', progress: 30 }))

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setState(prev => ({
        ...prev,
        enhancedImageUrl: prev.originalImageUrl,
        status: 'ready',
        progress: 70,
      }))
    } catch {
      setError('Image enhancement failed')
      setState(prev => ({ ...prev, status: 'idle' }))
    }
  }

  const handleDescribe = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const description = (formData.get('description') as string) || state.description
    const craft = (formData.get('craft') as string) || state.craft
    const region = (formData.get('region') as string) || state.region

    setState(prev => ({
      ...prev,
      description,
      craft,
      region,
      status: 'processing',
      current: 'catalog',
    }))
  }

  const handleCatalogGeneration = async () => {
    if (!state.originalImageUrl) {
      setError('Please upload an image first')
      return
    }

    setState(prev => ({ ...prev, status: 'processing' }))

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setState(prev => ({
        ...prev,
        priceSuggestion: 5000,
        status: 'ready',
        current: 'price',
        progress: 80,
      }))
    } catch {
      setError('Catalog generation failed')
      setState(prev => ({ ...prev, status: 'idle' }))
    }
  }

  const handlePrice = async () => {
    setState(prev => ({ ...prev, status: 'ready', progress: 90, current: 'publish' }))
  }

  const handlePublish = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setState(prev => ({
        ...prev,
        status: 'ready',
        progress: 100,
        error: null,
        current: 'publish',
      }))
      alert('Artwork published successfully!')
    } catch {
      setError('Publish failed')
    }
  }

  const progress = state.progress / 100
  const progressPercent = progress > 0.99 ? 100 : Math.round(progress * 100)

  if (state.error && state.status === 'idle' && user && user.role !== 'artisan' && user.role !== 'admin') {
    return (
      <div className="bg-canvas min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-ink mb-4">Access Denied</h2>
          <p className="text-stone-500">{state.error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-terracotta text-white px-6 py-3 rounded-lg hover:bg-terracotta/90 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-canvas min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl md:text-7xl font-serif text-ink">AI Artisan Studio</h1>
          <div className="text-sm text-stone-500">
            {'✓ ' + state.current}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="relative">
            <div className="h-4 bg-stone-200 rounded-full w-full" />
            <div className="absolute inset-0 bg-terracotta h-2 rounded-full"
                 style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="text-center text-sm text-stone-500 mt-2">
            {state.current.toUpperCase()}
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-8">
          {/* Upload Step */}
          {state.current === 'upload' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-ink mb-4">Step 1: Upload Artwork</h2>
              <p className="text-sm text-stone-500 mb-4">Upload a high-quality image of your artwork</p>

              <div className="border-2 border-dashed border-terracotta rounded-lg p-6 text-center">
                <div className="flex items-center justify-center">
                  <div className="text-4xl text-stone-400">
                    🖼️
                  </div>
                </div>
                <p className="text-sm text-stone-500 mt-2">
                  Drag and drop or click to upload your artwork image
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-4 text-sm text-stone-500 cursor-pointer"
                />
                <p className="text-sm text-stone-400 mt-2">
                  Supported formats: JPG, JPEG, PNG, WebP
                </p>
              </div>

              {state.error && (
                <div className="mt-2 text-sm text-red-500">{state.error}</div>
              )}

              {state.originalImageUrl && (
                <div className="mt-4">
                  <button
                    onClick={() => setState(prev => ({ ...prev, current: 'enhance' }))}
                    className="px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/70"
                  >
                    Continue to Enhance
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Enhance Step */}
          {state.current === 'enhance' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-ink mb-4">Step 2: Enhance Image</h2>
              <p className="text-sm text-stone-500 mb-4">
                We'll enhance your image to make it marketplace-ready
              </p>

              <form onSubmit={handleEnhanceImage}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-1/2">
                    {state.originalImageUrl && (
                      <img
                        src={state.originalImageUrl}
                        alt="Original Artwork"
                        className="w-full h-48 object-cover rounded-lg shadow-sm"
                      />
                    )}
                  </div>
                  <div className="w-1/2">
                    <div className="flex flex-col space-y-3">
                      <div className="text-center mb-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full border-2 border-dashed border-terracotta">
                            {state.originalImageUrl && (
                              <img src={state.originalImageUrl} alt="Artwork Preview" className="w-full h-full object-cover rounded-full" />
                            )}
                          </div>
                          <div className="text-center text-xs text-stone-500 mt-1">
                            Original Image
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-stone-500">Enhancement Options:</span>
                          <div className="flex items-center space-x-3">
                            {['background_removal', 'lighting', 'crop', 'brightness', 'contrast', 'sharpness'].map(op => (
                              <button
                                key={op}
                                type="button"
                                onClick={() => setState(prev => ({ ...prev, selectedOp: op }))}
                                className="px-3 py-1 bg-gray-100 rounded text-stone-500 hover:bg-terracotta/20"
                                title={op}
                              >
                                {op[0].toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="mt-4 text-center">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/70"
                          >
                            Enhance Image
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Describe Step */}
          {state.current === 'describe' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-ink mb-4">Step 3: Describe Your Artwork</h2>
              <p className="text-sm text-stone-500 mb-4">
                Tell us about your artwork in your own words or use AI assistance
              </p>

              <form onSubmit={handleDescribe} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-1/3">
                    <label className="block text-sm font-semibold text-stone-500">Description</label>
                    <textarea
                      name="description"
                      rows={4}
                      defaultValue={state.description}
                      className="w-full p-2 border border-stone-200 rounded-lg focus:ring-terracotta focus:border-terracotta"
                    />
                  </div>
                  <div className="w-full sm:w-1/3">
                    <label className="block text-sm font-semibold text-stone-500">Craft</label>
                    <input
                      type="text"
                      name="craft"
                      defaultValue={state.craft}
                      className="w-full p-2 border border-stone-200 rounded-lg focus:ring-terracotta focus:border-terracotta"
                      placeholder="e.g., Blue Pottery"
                    />
                  </div>
                  <div className="w-full sm:w-1/3">
                    <label className="block text-sm font-semibold text-stone-500">Region</label>
                    <input
                      type="text"
                      name="region"
                      defaultValue={state.region}
                      className="w-full p-2 border border-stone-200 rounded-lg focus:ring-terracotta focus:border-terracotta"
                      placeholder="e.g., Jaipur, Rajasthan"
                    />
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-semibold text-stone-500 mb-2">Language</label>
                    <select
                      value={state.language}
                      onChange={(e) => setState(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full p-2 border border-stone-200 rounded-lg focus:ring-terracotta focus:border-terracotta"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="mr">Marathi</option>
                      <option value="te">Telugu</option>
                      <option value="ta">Tamil</option>
                      <option value="kn">Kannada</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleCatalogGeneration}
                    className="w-full bg-terracotta text-white py-3 rounded-lg font-medium hover:bg-terracotta/90 transition-colors"
                  >
                    Generate Catalog
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Catalog Step */}
          {state.current === 'catalog' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-ink mb-4">AI-Generated Catalog</h2>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="text-lg font-medium text-ink">Title:</h3>
                  <p className="text-lg font-medium text-ink">{state.craft ? `${state.craft} Artwork` : 'Generated Title'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-1/3">
                    <p className="text-sm text-stone-500">Craft:</p>
                    <p className="text-sm text-stone-500">{state.craft || 'Not specified'}</p>
                  </div>
                  <div className="w-1/3">
                    <p className="text-sm text-stone-500">Region:</p>
                    <p className="text-sm text-stone-500">{state.region || 'Not specified'}</p>
                  </div>
                  <div className="w-1/3">
                    <p className="text-sm text-stone-500">Language:</p>
                    <p className="text-sm text-stone-500">{state.language}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setState(prev => ({ ...prev, current: 'price' }))}
                  className="w-full bg-terracotta text-white py-3 rounded-lg font-medium hover:bg-terracotta/90 transition-colors"
                >
                  Continue to Pricing
                </button>
              </div>
            </div>
          )}

          {/* Price Step */}
          {state.current === 'price' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-ink mb-4">Step 5: Price Suggestion</h2>
              <div className="space-y-4">
                <p className="text-sm text-stone-500">AI Suggested Price:</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-ink">{state.priceSuggestion?.toLocaleString() || '₹0'}</span>
                  <span className="text-sm text-stone-400">KLC</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-stone-500">Suggested Range:</span>
                  <span className="ml-2 text-stone-500">
                    ₹{state.priceSuggestion ? (state.priceSuggestion * 0.8).toLocaleString() : ' — '} - ₹{state.priceSuggestion ? (state.priceSuggestion * 1.2).toLocaleString() : ' — '}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handlePrice}
                  className="w-full bg-terracotta text-white py-3 rounded-lg hover:bg-terracotta/90 transition-colors"
                >
                  Accept Price Suggestion
                </button>
              </div>
            </div>
          )}

          {/* Publish Step */}
          {state.current === 'publish' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-ink mb-4">Final Review</h2>
              <div className="space-y-4">
                <p className="text-sm text-stone-500">Title:</p>
                <p className="text-sm text-ink">{state.craft ? `${state.craft} Artwork` : 'Generated Title'}</p>

                <p className="text-sm text-stone-500">Description:</p>
                <p className="text-sm text-stone-500">{state.description || 'No description provided'}</p>

                <p className="text-sm text-stone-500">Price:</p>
                <p className="text-lg font-bold text-ink">{state.priceSuggestion?.toLocaleString() || '₹0'}</p>

                <p className="text-sm text-stone-500">Artisan: {user?.display_name || 'Unknown'}</p>
                <p className="text-sm text-stone-500">Region: {state.region || 'Not specified'}</p>
                <p className="text-sm text-stone-500">Status: {state.status}</p>

                <div className="mt-6">
                  <button
                    onClick={handlePublish}
                    className="w-full bg-brand-blue text-white py-3 rounded-lg font-medium hover:bg-brand-blue/90 transition-colors shadow-md"
                  >
                    PUBLISH TO KALAA
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
