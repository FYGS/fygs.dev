"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, RotateCw, Settings, Minimize, PictureInPicture } from "lucide-react";
import { useLessonProgress } from "@/hooks/use-lesson-progress";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  lesson: {
    id: string;
    title: string;
    videoUrl: string | null;
    duration: number | null;
  };
  userId: string;
  initialProgress: {
    watchTime: number;
    completed: boolean;
  } | null;
}

export function VideoPlayer({ lesson, userId, initialProgress }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialProgress?.watchTime || 0);
  const [duration, setDuration] = useState(lesson.duration || 0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  // UI state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isPiPSupported, setIsPiPSupported] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  const progressController = useLessonProgress({
    lessonId: lesson.id,
    enabled: !!userId,
    onCompleted: () => {/* could trigger UI toast later */},
  });

  // Auto-hide controls
  const hideControlsAfterDelay = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  // Check PiP support
  useEffect(() => {
    setIsPiPSupported(document.pictureInPictureEnabled);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
      if (initialProgress?.watchTime) {
        video.currentTime = initialProgress.watchTime;
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      progressController.markCompleted();
    };

    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [initialProgress, progressController]);

  useEffect(() => {
    if (isPlaying) {
      progressController.start(() => videoRef.current?.currentTime || 0);
      hideControlsAfterDelay();
    } else {
      progressController.stop();
    }
    return () => progressController.stop();
  }, [isPlaying, progressController, hideControlsAfterDelay]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (value[0] / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0] / 100;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!isFullscreen) {
        await container.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.warn('Fullscreen operation failed:', error);
    }
  };

  const togglePictureInPicture = async () => {
    const video = videoRef.current;
    if (!video || !isPiPSupported) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (error) {
      console.warn('Picture-in-Picture operation failed:', error);
    }
  };

  const handleContainerClick = () => {
    togglePlay();
    setShowControls(true);
    hideControlsAfterDelay();
  };

  const handleMouseMove = () => {
    setShowControls(true);
    hideControlsAfterDelay();
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!lesson.videoUrl) {
    return (
      <div className="aspect-video bg-linear-to-br from-gray-900 to-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🎥</div>
          <p className="text-lg font-medium">Vidéo bientôt disponible</p>
          <p className="text-sm text-gray-400 mt-2">Cette leçon sera mise à jour prochainement</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative aspect-video bg-black rounded-lg overflow-hidden group cursor-pointer"
      onClick={handleContainerClick}
      onMouseMove={handleMouseMove}
    >
      <video
        ref={videoRef}
        src={lesson.videoUrl}
        className="w-full h-full object-contain"
        playsInline
        preload="metadata"
      />

      {/* Loading Overlay */}
      {(isLoading || isBuffering) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="text-white flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="text-lg">{isLoading ? 'Chargement...' : 'Buffering...'}</span>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className={cn(
        "absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/20 transition-opacity duration-300",
        showControls ? 'opacity-100' : 'opacity-0'
      )}>
        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-20 w-20 text-white hover:bg-white/20 rounded-full backdrop-blur-xs bg-black/30 transition-all duration-200 hover:scale-110"
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          >
            {isPlaying ? (
              <Pause className="h-10 w-10" />
            ) : (
              <Play className="h-10 w-10 ml-1" />
            )}
          </Button>
        </div>

        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
          <div className="text-white">
            <h3 className="font-semibold text-lg">{lesson.title}</h3>
            <div className="flex items-center gap-2 text-sm text-white/80 mt-1">
              <span>Vitesse: {playbackRate}x</span>
              {isPiPSupported && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-white/80 hover:text-white hover:bg-white/20"
                  onClick={(e) => { e.stopPropagation(); togglePictureInPicture(); }}
                >
                  <PictureInPicture className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute top-16 right-4 bg-black/90 rounded-lg p-3 min-w-[200px]">
            <h4 className="text-white font-medium mb-3">Paramètres</h4>
            <div className="space-y-3">
              <div>
                <label className="text-white/80 text-sm block mb-2">Vitesse de lecture</label>
                <div className="grid grid-cols-2 gap-1">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <Button
                      key={rate}
                      variant={playbackRate === rate ? "default" : "ghost"}
                      size="sm"
                      className="h-6 text-xs"
                      onClick={(e) => { e.stopPropagation(); changePlaybackRate(rate); }}
                    >
                      {rate}x
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[progressPercentage]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-white/90 font-medium">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-white hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); skip(-10); }}
                title="Reculer de 10s"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); skip(10); }}
                title="Avancer de 10s"
              >
                <RotateCw className="h-4 w-4" />
              </Button>

              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <div className="w-20">
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                <span className="text-xs text-white/80 w-8">{Math.round(volume * 100)}%</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs text-white/80 bg-black/50 px-2 py-1 rounded">
                {Math.round(progressPercentage)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
