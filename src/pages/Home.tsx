import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Skill, Project, Experience, ApiResponse, ApiErrorResponse, Settings } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { HeroSection, TechStackSection, CurrentWorkSection, SocialLinks } from '../components/home';

export function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skillsByCategory, setSkillsByCategory] = useState<{ [key: string]: Skill[] }>({});
  const [settings, setSettings] = useState({
    homePage: {
      title: 'Welcome to My Portfolio',
      subtitle: 'Full Stack Developer',
      description: 'I build modern web applications with cutting-edge technologies'
    },
    socialLinks: {
      github: '',
      linkedin: '',
      twitter: ''
    }
  });

  useEffect(() => {
    const handleSettingsUpdate = (event: CustomEvent<Settings>) => {
      setSettings({
        homePage: event.detail.homePage,
        socialLinks: event.detail.socialLinks
      });
    };

    window.addEventListener('settings:updated', handleSettingsUpdate as EventListener);
    return () => {
      window.removeEventListener('settings:updated', handleSettingsUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [skillsRes, projectsRes, experiencesRes, settingsRes] = await Promise.all([
          api.get<ApiResponse<Skill[]>>('/skills'),
          api.get<ApiResponse<Project[]>>('/projects'),
          api.get<ApiResponse<Experience[]>>('/experiences'),
          api.get<ApiResponse<Settings>>('/settings')
        ]);

        const isErrorResponse = (res: ApiResponse<any>): res is ApiErrorResponse => {
          return 'error' in res && 'status' in res;
        };

        if (isErrorResponse(skillsRes)) throw new Error(skillsRes.error);
        if (isErrorResponse(projectsRes)) throw new Error(projectsRes.error);
        if (isErrorResponse(experiencesRes)) throw new Error(experiencesRes.error);
        if (isErrorResponse(settingsRes)) throw new Error(settingsRes.error);

        // Type assertion to get proper typing
        const skillsData = ('data' in skillsRes ? skillsRes.data : []) as Skill[];
        const projectsData = ('data' in projectsRes ? projectsRes.data : []) as Project[];
        const experiencesData = ('data' in experiencesRes ? experiencesRes.data : []) as Experience[];
        const settingsData = ('data' in settingsRes ? settingsRes.data : null) as Settings | null;

        if (settingsData) {
          setSettings({
            homePage: settingsData.homePage,
            socialLinks: settingsData.socialLinks
          });

          if (settingsData.visibility) {
            if (!settingsData.visibility.showSkills) {
              setSkillsByCategory({});
            } else {
              // Group skills by category
              const grouped = skillsData.reduce<{ [key: string]: Skill[] }>(
                (acc: { [key: string]: Skill[] }, skill: Skill) => {
                  const category = skill.category || 'Other';
                  if (!acc[category]) {
                    acc[category] = [];
                  }
                  acc[category].push(skill);
                  return acc;
                },
                {}
              );
              setSkillsByCategory(grouped);
            }

            if (!settingsData.visibility.showProjects) {
              setProjects([]);
            } else {
              setProjects(projectsData);
            }

            if (!settingsData.visibility.showExperiences) {
              setExperiences([]);
            } else {
              setExperiences(experiencesData);
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen neural-bg flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-primary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen neural-bg">
      <HeroSection
        title={settings.homePage.title}
        subtitle={settings.homePage.subtitle}
        description={settings.homePage.description}
      />

      <TechStackSection skillsByCategory={skillsByCategory} />

      <CurrentWorkSection projects={projects} experiences={experiences} />

      <SocialLinks
        github={settings.socialLinks.github}
        linkedin={settings.socialLinks.linkedin}
        twitter={settings.socialLinks.twitter}
      />

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}