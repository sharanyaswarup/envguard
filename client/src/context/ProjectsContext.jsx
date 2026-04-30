import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';

const ProjectsContext = createContext(null);

export const ProjectsProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = async (name, description) => {
    const { data } = await api.post('/projects', { name, description });
    setProjects((prev) => [data, ...prev]);
    return data;
  };

  const deleteProject = async (id) => {
    await api.delete(`/projects/${id}`);
    setProjects((prev) => prev.filter((p) => p._id !== id));
  };

  const getProject = async (id) => {
    const { data } = await api.get(`/projects/${id}`);
    return data;
  };

  return (
    <ProjectsContext.Provider value={{ projects, loading, fetchProjects, createProject, deleteProject, getProject }}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = () => useContext(ProjectsContext);
