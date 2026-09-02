import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { ChartDataDto } from '../../../types/dashboard.type';
import { formatCurrency } from '../../../utils/formatCurrency';

interface D3AreaChartProps {
  data: ChartDataDto[];
  height?: number;
  yAxisFormatter?: (value: number) => string;
  color?: string;
}

export default function D3AreaChart({
  data,
  height = 300,
  yAxisFormatter = (val) => val.toString(),
  color = '#3b82f6' // blue-500
}: D3AreaChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  // Responsive resize observer
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setWidth(entries[0].contentRect.width);
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0 || width === 0) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define Gradients
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '5%')
      .attr('stop-color', color)
      .attr('stop-opacity', 0.4);

    gradient.append('stop')
      .attr('offset', '95%')
      .attr('stop-color', color)
      .attr('stop-opacity', 0.0);

    // Scales
    const x = d3.scalePoint()
      .domain(data.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.1);

    const maxY = d3.max(data, d => Number(d.value)) || 0;
    const y = d3.scaleLinear()
      .domain([0, maxY * 1.1])
      .range([innerHeight, 0]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid-lines')
      .call(d3.axisLeft(y).tickSize(-innerWidth).tickFormat(() => '').ticks(5))
      .selectAll('line')
      .attr('stroke', '#f1f5f9')
      .attr('stroke-dasharray', '3,3');
    
    g.selectAll('.grid-lines path').remove();

    // Axes
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(10));
    
    xAxis.select('.domain').remove();
    xAxis.selectAll('text').attr('fill', '#94a3b8').attr('font-size', '12px').attr('font-weight', '500');

    const yAxis = g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat((d) => yAxisFormatter(Number(d))));

    yAxis.select('.domain').remove();
    yAxis.selectAll('.tick line').remove();
    yAxis.selectAll('text').attr('fill', '#94a3b8').attr('font-size', '12px').attr('font-weight', '500');

    // Generators
    const areaGenerator = d3.area<ChartDataDto>()
      .x(d => x(d.label)!)
      .y0(innerHeight)
      .y1(d => y(Number(d.value)))
      .curve(d3.curveMonotoneX);

    const lineGenerator = d3.line<ChartDataDto>()
      .x(d => x(d.label)!)
      .y(d => y(Number(d.value)))
      .curve(d3.curveMonotoneX);

    // Draw Area
    const pathArea = g.append('path')
      .datum(data)
      .attr('class', 'chart-area')
      .attr('fill', 'url(#area-gradient)')
      .attr('d', areaGenerator)
      .attr('opacity', 0); // initial state for GSAP

    // Draw Line
    const pathLine = g.append('path')
      .datum(data)
      .attr('class', 'chart-line')
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 3)
      .attr('d', lineGenerator);

    // Prepare line for GSAP draw effect
    const pathLength = pathLine.node()?.getTotalLength() || 0;
    pathLine
      .attr('stroke-dasharray', pathLength)
      .attr('stroke-dashoffset', pathLength);

    // Tooltip elements
    const tooltip = d3.select(containerRef.current)
      .append('div')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'white')
      .style('border', '1px solid #e2e8f0')
      .style('border-radius', '1rem')
      .style('padding', '8px 16px')
      .style('box-shadow', '0 10px 15px -3px rgb(0 0 0 / 0.1)')
      .style('font-size', '13px')
      .style('pointer-events', 'none')
      .style('z-index', '10')
      .style('opacity', '0')
      .style('transform', 'translateY(10px)')
      .style('transition', 'opacity 0.2s ease, transform 0.2s ease');

    // Overlay for catching mouse events across the whole chart area
    const overlay = g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all');

    // Hover vertical line indicator
    const hoverLine = g.append('line')
      .attr('class', 'hover-line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')
      .style('opacity', 0);

    // Hover dot
    const hoverDot = g.append('circle')
      .attr('class', 'hover-dot')
      .attr('r', 5)
      .attr('fill', 'white')
      .attr('stroke', color)
      .attr('stroke-width', 3)
      .style('opacity', 0)
      .style('pointer-events', 'none');

    // Mouse interactions
    overlay.on('mousemove', (event) => {
      const [mouseX] = d3.pointer(event);
      
      // Find closest point on X axis
      const domain = x.domain();
      const range = x.range();
      const step = x.step();
      
      // Calculate which point is closest based on mouseX
      let closestIndex = Math.round((mouseX - range[0]) / step);
      closestIndex = Math.max(0, Math.min(domain.length - 1, closestIndex));
      
      const closestLabel = domain[closestIndex];
      const closestData = data.find(d => d.label === closestLabel);
      if (!closestData) return;

      const exactX = x(closestLabel)!;
      const exactY = y(Number(closestData.value));

      // Move indicator line & dot
      hoverLine
        .attr('x1', exactX)
        .attr('x2', exactX)
        .style('opacity', 1);

      hoverDot
        .attr('cx', exactX)
        .attr('cy', exactY)
        .style('opacity', 1);

      // Tooltip position relative to container
      const [containerMouseX, containerMouseY] = d3.pointer(event, containerRef.current);
      
      tooltip
        .style('visibility', 'visible')
        .style('opacity', '1')
        .style('transform', 'translateY(0)')
        .style('left', (containerMouseX - 50) + 'px')
        .style('top', (containerMouseY - 60) + 'px')
        .html(`
          <div style="text-align: center;">
            <div style="color: #64748b; font-size: 11px; margin-bottom: 4px;">${closestData.label}</div>
            <strong style="color: #0f172a; font-size: 14px;">${yAxisFormatter === formatCurrency ? formatCurrency(Number(closestData.value)) : closestData.value}</strong>
          </div>
        `);
    });

    overlay.on('mouseout', () => {
      hoverLine.style('opacity', 0);
      hoverDot.style('opacity', 0);
      tooltip
        .style('opacity', '0')
        .style('transform', 'translateY(10px)');
    });

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };

  }, [data, width, height, yAxisFormatter, color]);

  // GSAP Animations
  useGSAP(() => {
    if (width > 0 && data && data.length > 0) {
      // Animate line drawing
      gsap.to('.chart-line', {
        strokeDashoffset: 0,
        duration: 2,
        ease: 'power3.out',
        delay: 0.2
      });

      // Fade in area
      gsap.to('.chart-area', {
        opacity: 1,
        duration: 1.5,
        ease: 'power2.inOut',
        delay: 0.5
      });
    }
  }, { dependencies: [data, width], scope: containerRef });

  return (
    <div ref={containerRef} className="w-full relative h-full">
      <svg ref={svgRef}></svg>
    </div>
  );
}
