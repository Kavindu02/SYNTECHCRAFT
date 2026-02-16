import { NextResponse } from 'next/server';
import projectsData from '@/data/projects.json';
import fs from 'fs/promises';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'projects.json');

export async function GET() {
  try {
    // In production (Vercel), we use the statically imported data
    // This avoids issues with the file system on serverless environments
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(projectsData);
    }
    
    // In development, we can still read from the file to get latest changes
    const data = await fs.readFile(dataPath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    // Fallback to imported data if file read fails
    return NextResponse.json(projectsData);
  }
}

export async function POST(request: Request) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ 
        success: false, 
        error: 'Writing to files is not supported in production (Vercel). Please use a database for persistent storage.' 
      }, { status: 403 });
    }

    const project = await request.json();
    const data = await fs.readFile(dataPath, 'utf8');
    const projects = JSON.parse(data);
    
    projects.push(project);
    
    await fs.writeFile(dataPath, JSON.stringify(projects, null, 2));
    return NextResponse.json({ success: true, project });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save project' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ 
        success: false, 
        error: 'Updating files is not supported in production (Vercel). Please use a database for persistent storage.' 
      }, { status: 403 });
    }

    const updatedProject = await request.json();
    const data = await fs.readFile(dataPath, 'utf8');
    let projects = JSON.parse(data);
    
    projects = projects.map((p: any) => p.title === updatedProject.oldTitle ? updatedProject : p);
    delete updatedProject.oldTitle; // Remove helper field
    
    await fs.writeFile(dataPath, JSON.stringify(projects, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ 
        success: false, 
        error: 'Deleting files is not supported in production (Vercel). Please use a database for persistent storage.' 
      }, { status: 403 });
    }

    const { title } = await request.json();
    const data = await fs.readFile(dataPath, 'utf8');
    const projects = JSON.parse(data);
    
    const filteredProjects = projects.filter((p: any) => p.title !== title);
    
    await fs.writeFile(dataPath, JSON.stringify(filteredProjects, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete project' }, { status: 500 });
  }
}
