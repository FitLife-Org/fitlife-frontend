import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { ChartDataDto } from '../../../types/dashboard.type';
import { formatCurrency } from '../../../utils/formatCurrency';

interface D3LineChartProps {
  data: ChartDataDto[];
  height?: number;
  yAxisFormatter?: (value: number) => string;
  color?: string;
}

export default function D3LineChart({
  data,
  height = 300,
  yAxisFormatter = (val) => val.toString(),
  color = '#3b82f6' // blue-500
}: D3LineChartProps) {
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

    const margin = { top: 30, right: 30, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create a drop shadow filter for the glowing line effect
    const defs = svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'blur');
    
    // Create a composite to merge original line and the glow
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'blur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

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
      .attr('stroke', '#e2e8f0') // slate-200
      .attr('stroke-dasharray', '4,4');
    
    g.selectAll('.grid-lines path').remove();

    // Axes
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(12));
    
    xAxis.select('.domain').attr('stroke', '#cbd5e1').attr('stroke-width', 2);
    xAxis.selectAll('text').attr('fill', '#64748b').attr('font-size', '12px').attr('font-weight', '600');

    const yAxis = g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat((d) => yAxisFormatter(Number(d))));

    yAxis.select('.domain').remove();
    yAxis.selectAll('.tick line').remove();
    yAxis.selectAll('text').attr('fill', '#64748b').attr('font-size', '12px').attr('font-weight', '600');

    // Line Generator (Smooth Curve)
    const lineGenerator = d3.line<ChartDataDto>()
      .x(d => x(d.label)!)
      .y(d => y(Number(d.value)))
      .curve(d3.curveMonotoneX);

    // Draw Line with Glow
    const pathLine = g.append('path')
      .datum(data)
      .attr('class', 'chart-line')
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 4)
      .attr('filter', 'url(#glow)')
      .attr('d', lineGenerator);

    // Data points (Dots)
    const dots = g.selectAll('.data-dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'data-dot')
      .attr('cx', d => x(d.label)!)
      .attr('cy', d => y(Number(d.value)))
      .attr('r', 0) // Start with 0 radius for GSAP
      .attr('fill', '#ffffff')
      .attr('stroke', color)
      .attr('stroke-width', 3);

    // Prepare line for GSAP draw effect
    const pathLength = pathLine.node()?.getTotalLength() || 0;
    pathLine
      .attr('stroke-dasharray', pathLength)
      .attr('stroke-dashoffset', pathLength);

    // Tooltip setup
    const tooltip = d3.select(containerRef.current)
      .append('div')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'white')
      .style('border', '1px solid #e2e8f0')
      .style('border-radius', '12px')
      .style('padding', '10px 16px')
      .style('box-shadow', '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)')
      .style('font-size', '13px')
      .style('pointer-events', 'none')
      .style('z-index', '20')
      .style('opacity', '0')
      .style('transform', 'translateY(15px)')
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
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4')
      .style('opacity', 0)
      .style('pointer-events', 'none');

    // Mouse interactions
    overlay.on('mousemove', (event) => {
      const [mouseX] = d3.pointer(event);
      
      const domain = x.domain();
      const range = x.range();
      const step = x.step();
      
      let closestIndex = Math.round((mouseX - range[0]) / step);
      closestIndex = Math.max(0, Math.min(domain.length - 1, closestIndex));
      
      const closestLabel = domain[closestIndex];
      const closestData = data.find(d => d.label === closestLabel);
      if (!closestData) return;

      const exactX = x(closestLabel)!;

      // Enlarge the specific dot being hovered
      dots.transition().duration(150)
        .attr('r', d => d.label === closestLabel ? 8 : 5)
        .attr('fill', d => d.label === closestLabel ? color : '#ffffff')
        .attr('stroke', d => d.label === closestLabel ? '#ffffff' : color);

      // Move indicator line
      hoverLine
        .attr('x1', exactX)
        .attr('x2', exactX)
        .style('opacity', 0.5);

      // Tooltip position relative to container
      const [containerMouseX, containerMouseY] = d3.pointer(event, containerRef.current);
      
      tooltip
        .style('visibility', 'visible')
        .style('opacity', '1')
        .style('transform', 'translateY(0)')
        .style('left', (containerMouseX - 60) + 'px')
        .style('top', (containerMouseY - 70) + 'px')
        .html(`
          <div style="text-align: center;">
            <div style="color: #64748b; font-size: 11px; margin-bottom: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">${closestData.label}</div>
            <strong style="color: #0f172a; font-size: 15px; font-weight: 800;">${yAxisFormatter === formatCurrency ? formatCurrency(Number(closestData.value)) : closestData.value}</strong>
          </div>
        `);
    });

    overlay.on('mouseout', () => {
      hoverLine.style('opacity', 0);
      
      dots.transition().duration(200)
        .attr('r', 5)
        .attr('fill', '#ffffff')
        .attr('stroke', color);

      tooltip
        .style('opacity', '0')
        .style('transform', 'translateY(15px)');
    });

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };

  }, [data, width, height, yAxisFormatter, color]);

  // GSAP Animations for entry
  useGSAP(() => {
    if (width > 0 && data && data.length > 0) {
      // Animate line drawing
      gsap.to('.chart-line', {
        strokeDashoffset: 0,
        duration: 1.5,
        ease: 'power3.inOut'
      });

      // Pop in dots sequentially after line starts drawing
      gsap.to('.data-dot', {
        r: 5,
        duration: 0.5,
        stagger: 0.05,
        ease: 'back.out(2)',
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
