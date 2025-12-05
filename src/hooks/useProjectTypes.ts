import { useState } from 'react';

export type ProjectType = 'backend' | 'frontend' | 'fullstack' | 'ai' | 'mobile';

export function useProjectTypes() {
    const [projectTypes, setProjectTypes] = useState<ProjectType[]>(['backend', 'frontend', 'fullstack', 'ai', 'mobile']);

    const addProjectType = (newType: string) => {
        if (newType.trim()) {
            setProjectTypes([...projectTypes, newType.trim().toLowerCase() as ProjectType]);
            return true;
        }
        return false;
    };

    const editProjectType = (oldType: ProjectType, newType: string) => {
        if (newType.trim()) {
            setProjectTypes(projectTypes.map(type =>
                type === oldType ? newType.toLowerCase() as ProjectType : type
            ));
            return true;
        }
        return false;
    };

    const deleteProjectType = (typeToDelete: ProjectType) => {
        setProjectTypes(projectTypes.filter(type => type !== typeToDelete));
    };

    return {
        projectTypes,
        addProjectType,
        editProjectType,
        deleteProjectType
    };
}
