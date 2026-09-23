import React, { useEffect, useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { courseAPI, lessonsAPI, enrollmentAPI } from '../api/client';
import { RootState } from '../redux/store';

interface Module {
  moduleId: string;
  title: string;
  sortOrder: number;
  lessons: Lesson[];
}

interface Lesson {
  lessonId: string;
  title: string;
  videoUrl: string;
  durationSec: number;
}

interface Course {
  courseId: string;
  title: string;
  description: string;
  modules: Module[];
  instructor: { name: string };
}

interface LessonProgressItem {
  lessonId: string;
  completed: boolean;
}

const CourseLearningPage: React.FC = () => {
  const { courseId, enrollmentId } = useParams<{ courseId: string; enrollmentId: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [markingComplete, setMarkingComplete] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);

  // Fetch course and enrollment
  useEffect(() => {
    if (!user || !courseId || !enrollmentId) return;

    fetchCourseAndProgress();
  }, [courseId, enrollmentId, user]);

  const fetchCourseAndProgress = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch course with modules and lessons
      const courseResponse = await courseAPI.getById(courseId!);
      console.log('📚 Course loaded:', courseResponse.data);
      setCourse(courseResponse.data);

      // Fetch enrollment details
      const enrollmentResponse = await enrollmentAPI.getById(enrollmentId!);
      console.log('📋 Enrollment loaded:', enrollmentResponse.data);
      setEnrollment(enrollmentResponse.data);

      // Fetch lesson progress
      const progressResponse = await lessonsAPI.getLessonProgress(enrollmentId!);
      console.log('✅ Lesson progress loaded:', progressResponse.data);
      
      const completedSet = new Set(
        progressResponse.data.lessonProgress
          .filter((lp: any) => lp.completed)
          .map((lp: any) => lp.lessonId)
      );
      setCompletedLessons(completedSet);

      // Set first module as selected
      if (courseResponse.data.modules && courseResponse.data.modules.length > 0) {
        setSelectedModule(courseResponse.data.modules[0].moduleId);
        if (courseResponse.data.modules[0].lessons && courseResponse.data.modules[0].lessons.length > 0) {
          setSelectedLesson(courseResponse.data.modules[0].lessons[0].lessonId);
        }
      }
    } catch (err: any) {
      console.error('Failed to load course:', err);
      setError(err.response?.data?.error || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkLessonComplete = async (lessonId: string) => {
    if (!enrollmentId) return;

    setMarkingComplete(lessonId);
    try {
      const response = await lessonsAPI.completeLesson(enrollmentId, lessonId);
      console.log('✅ Lesson marked complete:', response.data);

      // Update completed lessons
      setCompletedLessons(prev => new Set([...prev, lessonId]));

      // Refresh enrollment to get updated progress
      const enrollmentResponse = await enrollmentAPI.getById(enrollmentId);
      setEnrollment(enrollmentResponse.data);
      console.log('📊 Progress updated:', enrollmentResponse.data.progressPercent + '%');

      // Check if all lessons are done (progress should be 100)
      if (enrollmentResponse.data.progressPercent === 100) {
        console.log('🎉 All lessons completed! Certificate generated automatically.');
      }
    } catch (err: any) {
      console.error('Failed to mark lesson complete:', err);
      setError(err.response?.data?.error || 'Failed to mark lesson complete');
    } finally {
      setMarkingComplete(null);
    }
  };

  // Convert a plain YouTube link (watch/shorts/short-link) into the embeddable
  // /embed/ form. A raw "watch" URL can't be loaded in an iframe - YouTube's
  // watch page sends X-Frame-Options: sameorigin, so the browser refuses it.
  const getEmbeddableVideoUrl = (url: string): string => {
    if (!url) return '';

    if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com')) {
      return url;
    }

    const shortLinkMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (shortLinkMatch) {
      return `https://www.youtube.com/embed/${shortLinkMatch[1]}`;
    }

    const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch) {
      return `https://www.youtube.com/embed/${shortsMatch[1]}`;
    }

    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (watchMatch && url.includes('youtube.com')) {
      return `https://www.youtube.com/embed/${watchMatch[1]}`;
    }

    return url;
  };

  const getCurrentModule = () => course?.modules?.find(m => m.moduleId === selectedModule);
  const getCurrentLesson = () => getCurrentModule()?.lessons?.find(l => l.lessonId === selectedLesson);

  const currentModule = getCurrentModule();
  const currentLesson = getCurrentLesson();
  const totalLessons = course?.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0;
  const isLessonCompleted = selectedLesson ? completedLessons.has(selectedLesson) : false;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-700 mb-4">Course not found</p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="px-6 py-3 bg-secondary text-white font-bold rounded-lg hover:bg-primary transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary">{course.title}</h1>
              <p className="text-gray-600">Instructor: {course.instructor.name}</p>
            </div>
            <button
              onClick={() => navigate('/student/dashboard')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              ← Back
            </button>
          </div>

          {/* Progress Bar */}
          {enrollment && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Course Progress</span>
                <span className="text-sm font-semibold text-secondary">{enrollment.progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-accent h-3 rounded-full transition-all duration-300"
                  style={{ width: `${enrollment.progressPercent}%` }}
                />
              </div>
              {enrollment.completed && (
                <p className="mt-2 text-sm text-green-600 font-semibold">✅ Course Completed!</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Modules & Lessons */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow sticky top-24">
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-bold text-lg text-primary">Course Content</h3>
                <p className="text-sm text-gray-600 mt-1">{completedLessons.size} of {totalLessons} lessons</p>
              </div>

              <div className="divide-y max-h-96 overflow-y-auto">
                {course.modules.map((module) => (
                  <div key={module.moduleId}>
                    <button
                      onClick={() => setSelectedModule(module.moduleId)}
                      className={`w-full text-left px-4 py-3 font-semibold transition ${
                        selectedModule === module.moduleId
                          ? 'bg-blue-50 text-primary border-l-4 border-primary'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="text-lg mr-2">📁</span>
                        {module.title}
                      </div>
                    </button>

                    {selectedModule === module.moduleId && (
                      <div className="bg-gray-50">
                        {module.lessons?.map((lesson) => {
                          const isCompleted = completedLessons.has(lesson.lessonId);
                          return (
                            <button
                              key={lesson.lessonId}
                              onClick={() => setSelectedLesson(lesson.lessonId)}
                              className={`w-full text-left px-6 py-2 text-sm transition flex items-center ${
                                selectedLesson === lesson.lessonId
                                  ? 'bg-blue-100 text-primary font-semibold'
                                  : 'text-gray-600 hover:bg-white'
                              }`}
                            >
                              <span className="mr-2">{isCompleted ? '✅' : '▶️'}</span>
                              {lesson.title}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Video Player */}
          <div className="lg:col-span-3">
            {currentLesson ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {/* Video Player */}
                <div className="bg-black aspect-video flex items-center justify-center relative">
                  {currentLesson.videoUrl ? (
                    <>
                      {videoLoading && (
                        <div className="text-white absolute inset-0 flex items-center justify-center">
                          Loading video...
                        </div>
                      )}
                      <iframe
                        width="100%"
                        height="100%"
                        src={getEmbeddableVideoUrl(currentLesson.videoUrl)}
                        title={currentLesson.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onLoad={() => setVideoLoading(false)}
                        onLoadStart={() => setVideoLoading(true)}
                      />
                    </>
                  ) : (
                    <p className="text-white">No video available for this lesson yet.</p>
                  )}
                </div>

                {/* Lesson Details */}
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-3xl font-bold text-primary mb-2">{currentLesson.title}</h2>
                      <p className="text-gray-600 mb-4">{currentModule?.title}</p>
                      <p className="text-gray-600">
                        ⏱️ Duration: {Math.floor(currentLesson.durationSec / 60)} minutes
                      </p>
                    </div>

                    {isLessonCompleted ? (
                      <div className="text-center">
                        <p className="text-4xl mb-2">✅</p>
                        <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full font-bold">
                          Completed
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleMarkLessonComplete(currentLesson.lessonId)}
                        disabled={markingComplete === currentLesson.lessonId}
                        className="px-6 py-3 bg-accent text-white font-bold rounded-lg hover:bg-secondary transition disabled:opacity-50"
                      >
                        {markingComplete === currentLesson.lessonId ? '⏳ Marking...' : '✓ Mark Complete'}
                      </button>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-4 mt-8 pt-8 border-t">
                    <button
                      onClick={() => {
                        const allLessons = course.modules.flatMap(m => m.lessons || []);
                        const currentIndex = allLessons.findIndex(l => l.lessonId === currentLesson.lessonId);
                        if (currentIndex > 0) {
                          const prevLesson = allLessons[currentIndex - 1];
                          setSelectedLesson(prevLesson.lessonId);
                          const moduleId = course.modules.find(m => 
                            m.lessons?.find(l => l.lessonId === prevLesson.lessonId)
                          )?.moduleId;
                          setSelectedModule(moduleId || null);
                        }
                      }}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition"
                    >
                      ← Previous Lesson
                    </button>

                    <button
                      onClick={() => {
                        const allLessons = course.modules.flatMap(m => m.lessons || []);
                        const currentIndex = allLessons.findIndex(l => l.lessonId === currentLesson.lessonId);
                        if (currentIndex < allLessons.length - 1) {
                          const nextLesson = allLessons[currentIndex + 1];
                          setSelectedLesson(nextLesson.lessonId);
                          const moduleId = course.modules.find(m => 
                            m.lessons?.find(l => l.lessonId === nextLesson.lessonId)
                          )?.moduleId;
                          setSelectedModule(moduleId || null);
                        }
                      }}
                      className="flex-1 px-6 py-3 bg-secondary text-white font-bold rounded-lg hover:bg-primary transition"
                    >
                      Next Lesson →
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-2xl font-bold text-gray-700 mb-4">No lessons available</p>
                <p className="text-gray-600">This course has no lessons yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearningPage;
