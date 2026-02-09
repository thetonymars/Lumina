
import React, { useState, useCallback } from 'react';
import { DesignState, DesignStyle, DesignHistoryItem } from './types';
import { generateReimaginedRoom, editRoomByChat, getShoppingLinks } from './services/geminiService';
import ComparisonSlider from './components/ComparisonSlider';
import StylePicker from './components/StylePicker';
import ChatBox from './components/ChatBox';

const App: React.FC = () => {
  const [state, setState] = useState<DesignState>({
    originalImage: null,
    currentImage: null,
    history: [],
    selectedStyle: DesignStyle.MID_CENTURY,
    isGenerating: false,
    isSearching: false,
    recommendations: []
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setState(prev => ({
          ...prev,
          originalImage: base64,
          currentImage: base64,
          history: [],
          recommendations: []
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (style?: DesignStyle) => {
    if (!state.originalImage) return;
    
    const targetStyle = style || state.selectedStyle;
    setState(prev => ({ ...prev, isGenerating: true, selectedStyle: targetStyle }));

    try {
      const { imageUrl, description } = await generateReimaginedRoom(state.originalImage, targetStyle);
      setState(prev => ({
        ...prev,
        currentImage: imageUrl,
        isGenerating: false,
        history: [{ role: 'model', text: description, imageUrl }]
      }));
      
      // Auto-trigger shopping links for the new design
      handleFetchShoppingLinks(imageUrl);
    } catch (error) {
      console.error(error);
      setState(prev => ({ ...prev, isGenerating: false }));
      alert("Something went wrong during generation. Please try again.");
    }
  };

  const handleFetchShoppingLinks = async (imageUrl: string) => {
    setState(prev => ({ ...prev, isSearching: true }));
    try {
      const links = await getShoppingLinks(imageUrl);
      setState(prev => ({ ...prev, recommendations: links, isSearching: false }));
    } catch (error) {
      console.error(error);
      setState(prev => ({ ...prev, isSearching: false }));
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!state.currentImage) return;

    setState(prev => ({
      ...prev,
      isGenerating: true,
      history: [...prev.history, { role: 'user', text: message }]
    }));

    try {
      const { imageUrl, text } = await editRoomByChat(state.currentImage, message, state.selectedStyle);
      setState(prev => ({
        ...prev,
        currentImage: imageUrl,
        isGenerating: false,
        history: [...prev.history, { role: 'model', text, imageUrl }]
      }));
      
      // Refresh shopping links for the edited design
      handleFetchShoppingLinks(imageUrl);
    } catch (error) {
      console.error(error);
      setState(prev => ({ ...prev, isGenerating: false }));
      alert("Failed to refine design. Please try again.");
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <i className="fa-solid fa-couch"></i>
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Lumina AI</h1>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-indigo-600 transition-colors">How it works</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Pricing</a>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors">
              Go Premium
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        {!state.originalImage ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                Transform Your Space with <span className="text-indigo-600">Generative AI</span>
              </h2>
              <p className="text-lg text-gray-600 mb-10">
                Upload a photo of your room and watch as our AI reimagines it in seconds. 
                Compare styles, refine details, and shop the look.
              </p>
              
              <label className="group relative cursor-pointer bg-white border-2 border-dashed border-gray-300 rounded-3xl p-12 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all block">
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <i className="fa-solid fa-cloud-arrow-up text-2xl"></i>
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-gray-900">Upload Room Photo</p>
                    <p className="text-gray-500 mt-1">PNG, JPG or JPEG up to 10MB</p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left: Design Visualization */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-2 rounded-2xl shadow-xl overflow-hidden">
                <ComparisonSlider original={state.originalImage} current={state.currentImage || state.originalImage} />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Select a Style</h3>
                  <button 
                    onClick={() => handleGenerate()}
                    disabled={state.isGenerating}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                  >
                    {state.isGenerating ? 'Generating...' : 'Regenerate'}
                  </button>
                </div>
                <StylePicker 
                  selected={state.selectedStyle} 
                  onSelect={(s) => {
                    handleGenerate(s);
                  }}
                  disabled={state.isGenerating}
                />
              </div>

              {state.isGenerating && (
                <div className="bg-indigo-600/5 border border-indigo-100 rounded-xl p-6 flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <i className="fa-solid fa-sparkles"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-indigo-900">AI is crafting your makeover...</h4>
                    <p className="text-sm text-indigo-700/70">Reimagining textures, lighting, and placement for {state.selectedStyle} style.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Design Chat & Shopping */}
            <div className="space-y-8 sticky top-24">
              <ChatBox 
                history={state.history} 
                onSendMessage={handleSendMessage} 
                isLoading={state.isGenerating}
                recommendations={state.recommendations}
              />
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => handleFileUpload({ target: { files: [] } } as any)}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Start New Project
                </button>
                <p className="text-center text-xs text-gray-400">
                  Made with <i className="fa-solid fa-heart text-red-400"></i> by Lumina AI
                </p>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default App;
