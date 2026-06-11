import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site, getCourseBySlug } from "@/lib/site";
import { FlyoverExperience } from "@/components/flyover/FlyoverExperience";

export function generateStaticParams() {
  return site.courses.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const course = getCourseBySlug(params.slug);
  if (!course) return {};
  return {
    title: `Hole-by-Hole Flyover — ${course.name}`,
    description: `Fly all ${course.holes.length} holes of ${course.name} in cinematic 3D — par ${course.par}, ${course.ratings[0]?.yards ?? ""} yards at ${site.identity.courseName}.`,
  };
}

export default function HolesPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { hole?: string };
}) {
  const course = getCourseBySlug(params.slug);
  if (!course) notFound();
  const initial = Number.parseInt(searchParams.hole ?? "1", 10) || 1;
  return <FlyoverExperience course={course} initialHole={initial} />;
}
